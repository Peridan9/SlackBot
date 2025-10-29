// Home Tab handler
// Displays a personalized dashboard for each user

import { App } from '@slack/bolt';
import { getAllChannelConfigs, getChannelsForUser, getTodayReports, getChannelConfig } from '../storage/memory';
import { buildReportModal } from '../modals/reportModal';
import { buildSetupModal } from '../modals/setupModal';
import { buildDeleteConfirmModal } from '../modals/confirmDeleteModal';

export const registerHomeTabHandler = (app: App): void => {
  
  // ============================================
  // Handle Home Tab Opened Event
  // ============================================
  app.event('app_home_opened', async ({ event, client }) => {
    const userId = event.user;

    try {
      // Get user's channels (where they need to report)
      const userChannels = getChannelsForUser(userId);
      
      // Get channels user created (admin check)
      const allConfigs = getAllChannelConfigs();
      const adminChannels = allConfigs.filter(config => config.createdBy === userId);
      const isAdmin = adminChannels.length > 0;

      // Build the home view
      const view = buildHomeView(userId, userChannels, adminChannels, isAdmin);

      // Publish the view
      await client.views.publish({
        user_id: userId,
        view: view
      });

      console.log(`📱 Home Tab opened for user ${userId} (Admin: ${isAdmin})`);
    } catch (error) {
      console.error('❌ Error publishing Home Tab:', error);
    }
  });

  // ============================================
  // Handle "Submit Report" Button
  // ============================================
  app.action('home_submit_report', async ({ ack, body, client }) => {
    await ack();

    const userId = body.user.id;

    try {
      // Get user's channels
      const userChannels = getChannelsForUser(userId);

      if (userChannels.length === 0) {
        // Shouldn't happen but handle it
        await client.chat.postEphemeral({
          channel: userId,
          user: userId,
          text: '📭 You\'re not configured to submit reports for any channels.'
        });
        return;
      }

      // Open the report modal (same as /report command)
      await client.views.open({
        trigger_id: (body as any).trigger_id,
        view: buildReportModal(userId, userChannels)
      });

      console.log(`✅ Opened report modal from Home Tab for user ${userId}`);
    } catch (error) {
      console.error('❌ Error opening report modal from Home Tab:', error);
    }
  });

  // ============================================
  // Handle "Add New Channel" Button
  // ============================================
  app.action('home_add_channel', async ({ ack, body, client }) => {
    await ack();

    const userId = body.user.id;

    try {
      // Send instructions message
      await client.chat.postEphemeral({
        channel: userId,
        user: userId,
        text: '➕ *Add New Channel*\n\n' +
              'To configure a new channel for daily reports:\n\n' +
              '1. Go to the channel you want to configure\n' +
              '2. Type `/setup`\n' +
              '3. Fill out the configuration form\n\n' +
              'The channel will then appear in your Home Tab management section! 📋'
      });

      console.log(`📝 Sent "Add Channel" instructions to user ${userId}`);
    } catch (error) {
      console.error('❌ Error sending add channel instructions:', error);
    }
  });

  // ============================================
  // Handle Channel Actions (Edit/Delete)
  // ============================================
  app.action('home_channel_action', async ({ ack, action, body, client }) => {
    await ack();

    const userId = body.user.id;
    const selectedValue = (action as any).selected_option.value;
    const [actionType, channelId] = selectedValue.split('_');

    try {
      if (actionType === 'edit') {
        // Fetch existing config
        const config = getChannelConfig(channelId);
        if (!config) {
          await client.chat.postEphemeral({
            channel: userId,
            user: userId,
            text: '❌ Configuration not found. It may have been deleted.'
          });
          console.log(`⚠️  Edit requested for channel ${channelId} but config not found`);
          return;
        }

        // Get channel info for the modal
        const channelInfo = await client.conversations.info({ channel: channelId });
        const channelName = channelInfo.channel?.name || config.channelName || 'Unknown';

        // Open setup modal with pre-filled values
        await client.views.open({
          trigger_id: (body as any).trigger_id,
          view: buildSetupModal(
            channelId,
            channelName,
            userId,  // Current user (not necessarily original creator)
            config   // Pass existing config for pre-filling
          )
        });
        console.log(`✏️  Opened edit modal for channel ${channelId} (#${channelName}) by user ${userId}`);

      } else if (actionType === 'delete') {
        // Fetch existing config
        const config = getChannelConfig(channelId);
        if (!config) {
          await client.chat.postEphemeral({
            channel: userId,
            user: userId,
            text: '❌ Configuration not found. It may have been deleted.'
          });
          console.log(`⚠️  Delete requested for channel ${channelId} but config not found`);
          return;
        }

        // Get channel name
        const channelInfo = await client.conversations.info({ channel: channelId });
        const channelName = channelInfo.channel?.name || config.channelName || 'Unknown';

        // Open delete confirmation modal
        await client.views.open({
          trigger_id: (body as any).trigger_id,
          view: buildDeleteConfirmModal(channelId, channelName)
        });
        console.log(`🗑️  Opened delete confirmation for channel ${channelId} (#${channelName}) by user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error handling channel action:', error);
      try {
        await client.chat.postEphemeral({
          channel: userId,
          user: userId,
          text: '❌ Sorry, something went wrong. Please try again.'
        });
      } catch (dmError) {
        console.error('❌ Could not send error message:', dmError);
      }
    }
  });
};

// ============================================
// Build Home View
// ============================================
function buildHomeView(
  userId: string,
  userChannels: any[],
  adminChannels: any[],
  isAdmin: boolean
) {
  const blocks: any[] = [];

  // Header - SAME FOR EVERYONE
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '🏠 Daily Reports'
    }
  });

  // ============================================
  // Section 1: User's Personal Channels (ALWAYS FIRST)
  // ============================================
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*👤 Your Channels*'
    }
  });

  // Show ALL channels user needs to report to (including ones they manage)
  if (userChannels.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '📭 You\'re not monitored in any channels yet.\n\nAsk your team admin to add you using `/setup` in a channel.'
      }
    });
  } else {
    // Show each channel user is monitored in
    userChannels.forEach(config => {
      // Check if user submitted report today
      const todayReports = getTodayReports(config.channelId);
      const userReport = todayReports.find(r => r.userId === userId);
      const status = userReport ? '✅ Submitted' : '⏳ Pending';

      // Check if user is also admin of this channel
      const isAdminOfChannel = adminChannels.some(adminConfig => adminConfig.channelId === config.channelId);
      const adminBadge = isAdminOfChannel ? ' 👑' : '';

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📌 *<#${config.channelId}>${adminBadge}*\n⏰ Report due: ${config.reportTime}\nStatus: ${status}`
        }
      });
    });
  }

  // Show Submit Report button if user has ANY channels (including admin ones)
  if (userChannels.length > 0) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📝 Submit Report'
          },
          action_id: 'home_submit_report',
          style: 'primary'
        }
      ]
    });
  }

  // ============================================
  // Section 2: Admin Channel Management
  // ============================================
  if (isAdmin) {
    // BIG visual separator
    blocks.push({ type: 'divider' });
    blocks.push({ type: 'divider' });

    // Admin section header (as a header, not just text)
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⚙️ ADMIN DASHBOARD'
      }
    });

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '📋 Channels you manage'
        }
      ]
    });

    // Show each channel the user created
    adminChannels.forEach(config => {
      // Count today's submissions
      const todayReports = getTodayReports(config.channelId);
      const submissionCount = todayReports.length;
      const totalUsers = config.users.length;

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📋 *<#${config.channelId}>*\n` +
                `├─ Reminder: ${config.reminderTime} | Report: ${config.reportTime}\n` +
                `├─ Monitored users: ${totalUsers}\n` +
                `└─ Today's submissions: ${submissionCount}/${totalUsers}`
        },
        accessory: {
          type: 'overflow',
          options: [
            {
              text: {
                type: 'plain_text',
                text: '✏️ Edit'
              },
              value: `edit_${config.channelId}`
            },
            {
              text: {
                type: 'plain_text',
                text: '🗑️ Delete'
              },
              value: `delete_${config.channelId}`
            }
          ],
          action_id: 'home_channel_action'
        }
      });
    });

    // Add New Channel button
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '➕ Add New Channel'
          },
          action_id: 'home_add_channel'
        }
      ]
    });

    // Quick stats
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📊 *Quick Stats*\nTotal channels: ${adminChannels.length} | Total users: ${adminChannels.reduce((sum, c) => sum + c.users.length, 0)}`
      }
    });
  }

  // Footer
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `_Last updated: ${new Date().toLocaleTimeString()}_`
      }
    ]
  });

  return {
    type: 'home' as const,
    blocks: blocks
  };
}

