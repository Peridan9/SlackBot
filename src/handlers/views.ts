// View handlers (modals, App Home, etc.)
import { App } from '@slack/bolt';
import { saveChannelConfig } from '../storage/memory';
import { ChannelConfig } from '../types';
import { SetupModalMetadata } from '../modals/setupModal';


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

  // Future modal handlers will go here...
};

