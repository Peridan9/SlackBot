// Send Reminders Job
// Runs every hour and sends reminder DMs to users in channels configured for that hour

import { App } from '@slack/bolt';
import { getAllChannelConfigs } from '../../storage/memory';

/**
 * Send reminder DMs to users who need to submit daily reports
 * This job runs every hour and checks which channels are configured for the current hour
 */
export async function sendRemindersJob(app: App): Promise<void> {
  // Get current time in HH:MM format (rounded to nearest 30 minutes)
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes() < 30 ? '00' : '30';
  const currentTime = `${currentHour}:${currentMinute}`;

  // Get all channel configurations
  const configs = getAllChannelConfigs();

  console.log(`🔔 Reminders Check | Time: ${currentTime} | Total configs: ${configs.length}`);

  if (configs.length === 0) {
    console.log('   📭 No channels configured');
    return;
  }

  // Filter to channels that have reminders scheduled for this time
  const configsToProcess = configs.filter(config => {
    return config.reminderTime === currentTime;
  });

  if (configsToProcess.length === 0) {
    console.log(`   📭 No channels scheduled for this time`);
    return;
  }

  console.log(`   📨 Processing ${configsToProcess.length} channel(s)...`);

  // Track statistics
  let remindersSent = 0;
  let remindersFailed = 0;

  // Process each configured channel
  for (const config of configsToProcess) {
    console.log(`   ├─ Channel: #${config.channelName} | Users: ${config.users.length}`);

    // Send reminder to each monitored user
    // TODO: Future enhancement - check if user already submitted report today
    // to avoid sending unnecessary reminders
    for (const userId of config.users) {
      try {
        await app.client.chat.postMessage({
          channel: userId, // DM the user
          text: `👋 *Time for your daily report!*\n\n` +
                `📍 *Channel:* <#${config.channelId}> (#${config.channelName})\n` +
                `📊 *Report due by:* ${config.reportTime}\n\n` +
                `*What to share:*\n` +
                `${config.reportFormat.map(q => `• ${q}`).join('\n')}\n\n` +
                `Use \`/report\` to submit your update! 📝`
        });
        remindersSent++;
      } catch (error) {
        console.error(`   │  ❌ Failed to DM user ${userId}:`, error instanceof Error ? error.message : error);
        remindersFailed++;
      }
    }
  }

  // Summary
  console.log(`   └─ Summary: ${remindersSent} sent, ${remindersFailed} failed`);
}

