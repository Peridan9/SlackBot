import { App } from '@slack/bolt';
import { getChannelConfig, getChannelsForUser } from '../storage/memory';
import { buildSetupModal } from '../modals/setupModal';
import { buildReportModal } from '../modals/reportModal';

export const registerCommandHandlers = (app: App): void => {

  // ============================================
  // /setup Command - Opens Setup Modal
  // ============================================
  app.command('/setup', async ({ command, ack, body, client }) => {
    await ack();

    const userId = command.user_id;
    const channelId = command.channel_id;

    // Check if command was run in a channel (not DM)
    if (!channelId.startsWith('C') && !channelId.startsWith('G')) {
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        text: '❌ Please run `/setup` from a channel where you want to configure daily reports, not in a DM!',
      });
      return;
    }

    // Check if channel is already configured
    const existingConfig = getChannelConfig(channelId);
    if (existingConfig) {
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        text: `⚠️ This channel is already configured!\n\nVisit the bot's Home tab to view and modify settings.`,
      });
      return;
    }

    // Get channel info
    try {
      const channelInfo = await client.conversations.info({
        channel: channelId,
      });
      
      const channelName = channelInfo.channel?.name || 'unknown';

      // Open the setup modal using our modal builder!
      await client.views.open({
        trigger_id: body.trigger_id, // CRITICAL: Must use trigger_id from body
        view: buildSetupModal(channelId, channelName, userId)
      });

      console.log(`✅ Opened setup modal for ${userId} in channel ${channelId} (#${channelName})`);
    } catch (error) {
      console.error('❌ Error opening modal:', error);
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        text: `❌ Sorry <@${userId}>, something went wrong. Make sure I have access to this channel!`,
      });
    }
  });

  // ============================================
  // /report Command - Opens Report Submission Modal
  // ============================================
  app.command('/report', async ({ command, ack, body, client }) => {
    await ack();

    const userId = command.user_id;

    try {
      // Find all channels this user is configured to report to
      const userChannels = getChannelsForUser(userId);

      // Check if user has any channels to report to
      if (userChannels.length === 0) {
        await client.chat.postEphemeral({
          channel: command.channel_id,
          user: userId,
          text: '📭 *No channels found!*\n\n' +
                'You are not configured to submit reports for any channels yet.\n\n' +
                '💡 Ask your channel admin to add you using `/setup` in a channel.'
        });
        return;
      }

      // Open the report modal
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildReportModal(userId, userChannels)
      });

      console.log(`✅ Opened report modal for user ${userId} (${userChannels.length} channel(s))`);
    } catch (error) {
      console.error('❌ Error opening report modal:', error);
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: userId,
        text: '❌ Sorry, something went wrong. Please try again!'
      });
    }
  });

  // Future commands will go here...
  // (Home Tab will handle configuration management)
};
