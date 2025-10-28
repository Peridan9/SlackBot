// Send Reminders Job
// Runs every hour and sends reminder DMs to users in channels configured for that hour

import { App } from '@slack/bolt';
import { getAllChannelConfigs } from '../../storage/memory';

/**
 * Send reminder DMs to users who need to submit daily reports
 * This job runs every hour and checks which channels are configured for the current hour
 */
export async function sendRemindersJob(app: App): Promise<void> {
  console.log('🔔 Running daily reminders job...');

  // Get current hour in HH:00 format
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentTime = `${currentHour}:00`;

  console.log(`⏰ Current time check: ${currentTime}`);

  // Get all channel configurations
  const configs = getAllChannelConfigs();

  if (configs.length === 0) {
    console.log('📭 No channels configured yet');
    return;
  }

  // Filter to channels that have reminders scheduled for this hour
  const configsToProcess = configs.filter(config => {
    // Extract hour from reminderTime (e.g., "09:30" -> "09")
    const [hour] = config.reminderTime.split(':');
    return hour === currentHour;
  });

  if (configsToProcess.length === 0) {
    console.log(`📭 No reminders scheduled for ${currentTime}`);
    return;
  }

  console.log(`📨 Sending reminders for ${configsToProcess.length} channel(s)`);

  // Process each configured channel
  for (const config of configsToProcess) {
    console.log(`  Processing channel: ${config.channelName} (${config.channelId})`);

    // Send reminder to each monitored user
    for (const userId of config.users) {
      try {
        await app.client.chat.postMessage({
          channel: userId, // DM the user
          text: `👋 *Time for your daily report!*\n\n` +
                `Please submit your report for <#${config.channelId}>.\n\n` +
                `*What to share:*\n` +
                `${config.reportFormat.map(q => `• ${q}`).join('\n')}\n\n` +
                `Reply to this message with your update! 📝`
        });
        console.log(`    ✅ Sent reminder to user ${userId}`);
      } catch (error) {
        console.error(`    ❌ Failed to send reminder to user ${userId}:`, error);
      }
    }
  }

  console.log('✅ Reminders job completed');
}

