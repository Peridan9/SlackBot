// Publish Reports Job
// Runs every hour and publishes collected reports to channels configured for that hour

import { App } from '@slack/bolt';
import { getAllChannelConfigs, getTodayReports, clearTodayReports } from '../../storage/memory';

/**
 * Collect and publish daily reports to configured channels
 * This job runs every hour and checks which channels are configured for the current hour
 */
export async function publishReportsJob(app: App): Promise<void> {
  console.log('📊 Running daily reports publishing job...');

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

  // Filter to channels that have report publishing scheduled for this hour
  const configsToProcess = configs.filter(config => {
    // Extract hour from reportTime (e.g., "17:30" -> "17")
    const [hour] = config.reportTime.split(':');
    return hour === currentHour;
  });

  if (configsToProcess.length === 0) {
    console.log(`📭 No reports scheduled for ${currentTime}`);
    return;
  }

  console.log(`📤 Publishing reports for ${configsToProcess.length} channel(s)`);

  // Process each configured channel
  for (const config of configsToProcess) {
    console.log(`  Processing channel: ${config.channelName} (${config.channelId})`);

    // Get today's reports for this channel
    const reports = getTodayReports(config.channelId);

    try {
      if (reports.length === 0) {
        // No reports submitted - post a message about it
        await app.client.chat.postMessage({
          channel: config.channelId,
          text: `📊 *Daily Reports Summary*\n\n` +
                `⚠️ No reports were submitted today.\n\n` +
                `Expected reports from: ${config.users.map(u => `<@${u}>`).join(', ')}`
        });
        console.log(`    ⚠️  No reports submitted for this channel`);
      } else {
        // Format and post the reports
        const reportBlocks = reports.map(report => 
          `*<@${report.userId}>*\n${report.report}`
        ).join('\n\n───────────────\n\n');

        const submittedUserIds = reports.map(r => r.userId);
        const missingUserIds = config.users.filter(id => !submittedUserIds.includes(id));

        let summaryText = `📊 *Daily Reports Summary*\n\n`;
        summaryText += `📝 *${reports.length} report(s) submitted:*\n\n`;
        summaryText += reportBlocks;

        if (missingUserIds.length > 0) {
          summaryText += `\n\n⚠️ *Missing reports from:* `;
          summaryText += missingUserIds.map(id => `<@${id}>`).join(', ');
        }

        await app.client.chat.postMessage({
          channel: config.channelId,
          text: summaryText
        });
        console.log(`    ✅ Published ${reports.length} report(s)`);

        // Clear today's reports after publishing
        clearTodayReports(config.channelId);
        console.log(`    🗑️  Cleared today's reports`);
      }
    } catch (error) {
      console.error(`    ❌ Failed to publish reports for channel ${config.channelId}:`, error);
    }
  }

  console.log('✅ Reports publishing job completed');
}

