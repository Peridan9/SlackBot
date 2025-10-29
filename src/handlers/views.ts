// View handlers (modals, App Home, etc.)
import { App } from '@slack/bolt';
import { saveChannelConfig, saveDailyReport, getChannelConfig, getTodayReports, deleteChannelConfig } from '../storage/memory';
import { ChannelConfig, DailyReport } from '../types';
import { SetupModalMetadata } from '../modals/setupModal';
import { ReportModalMetadata } from '../modals/reportModal';
import { DeleteModalMetadata } from '../modals/confirmDeleteModal';


export const registerViewHandlers = (app: App): void => {

  // ============================================
  // Handle Setup Modal Submission
  // ============================================
  app.view('setup_modal_submit', async ({ ack, body, view, client }) => {
    // Acknowledge the submission immediately (required!)
    await ack();

    try {
      // Extract metadata (channel info we stored when opening modal)
      const metadata = JSON.parse(view.private_metadata) as SetupModalMetadata;
      const { channelId, channelName, createdBy } = metadata;

      // Extract user inputs from the modal
      const values = view.state.values;
      
      // Type-safe extraction with proper checks
      const selectedUsers = values.users_block?.users_select?.selected_users;
      const reminderTime = values.reminder_time_block?.reminder_time_select?.selected_time;
      const reportTime = values.report_time_block?.report_time_select?.selected_time;

      // Validate that all required fields are present
      if (!selectedUsers || selectedUsers.length === 0) {
        throw new Error('No users selected');
      }
      if (!reminderTime) {
        throw new Error('Reminder time not selected');
      }
      if (!reportTime) {
        throw new Error('Report time not selected');
      }

      // Create the configuration object
      const config: ChannelConfig = {
        channelId,
        channelName,
        users: selectedUsers,
        reminderTime,
        reportTime,
        reportFormat: ['What did you work on today?'], // Default format
        createdBy,
        createdAt: new Date()
      };

      // Save to storage!
      saveChannelConfig(config);

      // Send confirmation message to the channel
      await client.chat.postMessage({
        channel: channelId,
        text: `✅ *Daily reports configured successfully!*\n\n` +
              `📋 Monitored users: ${selectedUsers.map(u => `<@${u}>`).join(', ')}\n` +
              `⏰ Reminder time: ${reminderTime}\n` +
              `📊 Report time: ${reportTime}\n\n` +
              `Users will receive daily reminders, and reports will be published here!`
      });

      // Send confirmation DM to the person who set it up
      await client.chat.postMessage({
        channel: createdBy,
        text: `🎉 *Setup complete!*\n\n` +
              `You've successfully configured daily reports for <#${channelId}>.\n\n` +
              `The bot will now:\n` +
              `• Send reminders at ${reminderTime}\n` +
              `• Publish reports at ${reportTime}`
      });

      console.log(`✅ Configuration saved for channel ${channelId} by user ${createdBy}`);
    } catch (error) {
      console.error('❌ Error handling modal submission:', error);
      
      // Try to notify the user of the error
      try {
        await client.chat.postMessage({
          channel: body.user.id,
          text: '❌ Sorry, something went wrong while saving your configuration. Please try again.'
        });
      } catch (dmError) {
        console.error('❌ Could not send error DM:', dmError);
      }
    }
  });

  // ============================================
  // Handle Report Modal Submission
  // ============================================
  app.view('report_modal_submit', async ({ ack, body, view, client }) => {
    // Acknowledge the submission immediately
    await ack();

    try {
      // Extract metadata (user info we stored when opening modal)
      const metadata = JSON.parse(view.private_metadata) as ReportModalMetadata;
      const userId = metadata.userId;

      // Extract user inputs from the modal
      const values = view.state.values;
      
      // Type-safe extraction with proper checks
      const selectedChannelId = values.channel_block?.channel_select?.selected_option?.value;
      const reportText = values.report_block?.report_input?.value;

      // Validate that all required fields are present
      if (!selectedChannelId) {
        throw new Error('No channel selected');
      }
      if (!reportText || reportText.trim().length === 0) {
        throw new Error('Report text is empty');
      }

      // Backend validation for report length (security layer)
      const trimmedReport = reportText.trim();
      if (trimmedReport.length < 10) {
        throw new Error('Report is too short. Please provide at least 10 characters.');
      }
      if (trimmedReport.length > 1000) {
        throw new Error('Report is too long. Please limit to 1000 characters.');
      }

      // Get the channel config to get channel name
      const channelConfig = getChannelConfig(selectedChannelId);
      if (!channelConfig) {
        throw new Error('Channel configuration not found');
      }

      // Check if user already submitted a report today (for better messaging)
      const existingReports = getTodayReports(selectedChannelId);
      const existingReport = existingReports.find(r => r.userId === userId);
      const isUpdate = existingReport !== undefined;

      // Get user info for the report
      const userInfo = await client.users.info({ user: userId });
      const userName = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';

      // Create the report object
      const report: DailyReport = {
        userId,
        userName,
        report: trimmedReport,  // Use validated variable
        timestamp: new Date()
      };

      // Save the report (will replace existing one if present)
      saveDailyReport(selectedChannelId, report);

      // Send confirmation DM to the user
      await client.chat.postMessage({
        channel: userId,
        text: `✅ *Report ${isUpdate ? 'updated' : 'submitted'} successfully!*\n\n` +
              `📍 *Channel:* <#${selectedChannelId}> (#${channelConfig.channelName})\n` +
              `📝 *Your report:*\n${reportText}\n\n` +
              `Your report will be published in the channel at ${channelConfig.reportTime}. 🎉`
      });

      console.log(`✅ Report submitted by ${userName} (${userId}) for channel ${selectedChannelId} (#${channelConfig.channelName})`);
    } catch (error) {
      console.error('❌ Error handling report submission:', error);
      
      // Try to notify the user of the error
      try {
        await client.chat.postMessage({
          channel: body.user.id,
          text: '❌ Sorry, something went wrong while submitting your report. Please try again.'
        });
      } catch (dmError) {
        console.error('❌ Could not send error DM:', dmError);
      }
    }
  });

  // ============================================
  // Handle Delete Confirmation Modal Submission
  // ============================================
  app.view('delete_confirm_modal', async ({ ack, view, body, client }) => {
    await ack();

    try {
      // Extract metadata (channel info we stored when opening modal)
      const metadata = JSON.parse(view.private_metadata) as DeleteModalMetadata;
      const { channelId, channelName } = metadata;
      const userId = body.user.id;

      // Delete the configuration
      const deleted = deleteChannelConfig(channelId);

      if (deleted) {
        // Send success confirmation DM
        await client.chat.postMessage({
          channel: userId,
          text: `✅ *Configuration deleted successfully!*\n\n` +
                `The daily reports configuration for <#${channelId}> (#${channelName}) has been removed.\n\n` +
                `• Reminders will no longer be sent\n` +
                `• Reports will no longer be published\n\n` +
                `You can set it up again anytime using \`/setup\` in the channel.`
        });
        console.log(`🗑️  Deleted config for channel ${channelId} (#${channelName}) by user ${userId}`);
      } else {
        // Configuration not found (edge case - might have been deleted by another admin)
        await client.chat.postMessage({
          channel: userId,
          text: `⚠️ *Could not delete configuration*\n\n` +
                `The configuration for <#${channelId}> (#${channelName}) was not found. ` +
                `It may have already been deleted.`
        });
        console.log(`⚠️  Attempted to delete config for channel ${channelId} but it was not found`);
      }

      // Home Tab will auto-refresh after modal closes
    } catch (error) {
      console.error('❌ Error handling delete confirmation:', error);
      try {
        await client.chat.postMessage({
          channel: body.user.id,
          text: '❌ Sorry, something went wrong while deleting the configuration. Please try again.'
        });
      } catch (dmError) {
        console.error('❌ Could not send error DM:', dmError);
      }
    }
  });

  // Future modal handlers will go here...
};

