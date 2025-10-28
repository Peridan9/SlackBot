// Publish Reports Job
// Runs every hour and publishes collected reports to channels configured for that hour

import { App } from '@slack/bolt';
import { getAllChannelConfigs, getTodayReports, clearTodayReports } from '../../storage/memory';

/**
 * Collect and publish daily reports to configured channels
 * This job runs every hour and checks which channels are configured for the current hour
 */
export async function publishReportsJob(app: App): Promise<void> {
  // Get current time in HH:MM format (rounded to nearest 30 minutes)
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes() < 30 ? '00' : '30';
  const currentTime = `${currentHour}:${currentMinute}`;

  // Get all channel configurations
  const configs = getAllChannelConfigs();

  console.log(`📊 Reports Check | Time: ${currentTime} | Total configs: ${configs.length}`);

  if (configs.length === 0) {
    console.log('   📭 No channels configured');
    return;
  }

  // Filter to channels that have report publishing scheduled for this time
  const configsToProcess = configs.filter(config => {
    return config.reportTime === currentTime;
  });

  if (configsToProcess.length === 0) {
    console.log(`   📭 No channels scheduled for this time`);
    return;
  }

  console.log(`   📤 Publishing reports for ${configsToProcess.length} channel(s)...`);

  // Track statistics
  let published = 0;
  let failed = 0;
  let totalReports = 0;

  // Process each configured channel
  for (const config of configsToProcess) {
    const reports = getTodayReports(config.channelId);
    
    console.log(`   ├─ Channel: #${config.channelName} | Reports: ${reports.length}/${config.users.length}`);

    try {
      if (reports.length === 0) {
        // No reports submitted - post a message about it
        await app.client.chat.postMessage({
          channel: config.channelId,
          text: `📊 *Daily Reports Summary*\n\n` +
                `⚠️ No reports were submitted today.\n\n` +
                `Expected reports from: ${config.users.map(u => `<@${u}>`).join(', ')}`
        });
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

        // Clear today's reports after publishing
        clearTodayReports(config.channelId);
        totalReports += reports.length;
      }
      published++;
    } catch (error) {
      console.error(`   │  ❌ Failed to publish:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  // Summary
  console.log(`   └─ Summary: ${published} published, ${failed} failed | Total reports: ${totalReports}`);
}

