// Send Reminders Job
// Runs every hour and sends reminder DMs to users in channels configured for that hour

import { App } from '@slack/bolt';
import { getAllChannelConfigs } from '../../storage/memory';

/**
 * Send reminder DMs to users who need to submit daily reports
 * This job runs every hour and checks which channels are configured for the current hour
 * Handles ALL logging internally for atomic output
 */
export async function sendRemindersJob(app: App): Promise<void> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Get current time in HH:MM format (rounded to nearest 30 minutes)
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes() < 30 ? '00' : '30';
  const currentTime = `${currentHour}:${currentMinute}`;

  // Get all channel configurations
  const configs = getAllChannelConfigs();

  // Buffer ALL logs for atomic output
  const logs: string[] = [];
  
  // Header
  logs.push('');
  logs.push('='.repeat(60));
  logs.push(`🔄 [${timestamp}] Starting job: reminders-check`);
  logs.push('-'.repeat(60));
  logs.push(`🔔 Reminders Check | Time: ${currentTime} | Total configs: ${configs.length}`);

  if (configs.length === 0) {
    logs.push('   📭 No channels configured');
    
    // Footer
    logs.push('-'.repeat(60));
    logs.push(`✅ [${new Date().toISOString()}] Job completed`);
    logs.push(`⏱️  Execution time: ${Date.now() - startTime}ms`);
    logs.push('='.repeat(60));
    logs.push('');
    
    console.log(logs.join('\n'));
    return;
  }

  // Filter to channels that have reminders scheduled for this time
  const configsToProcess = configs.filter(config => {
    return config.reminderTime === currentTime;
  });

  if (configsToProcess.length === 0) {
    logs.push(`   📭 No channels scheduled for this time`);
    
    // Footer
    logs.push('-'.repeat(60));
    logs.push(`✅ [${new Date().toISOString()}] Job completed`);
    logs.push(`⏱️  Execution time: ${Date.now() - startTime}ms`);
    logs.push('='.repeat(60));
    logs.push('');
    
    console.log(logs.join('\n'));
    return;
  }

  logs.push(`   📨 Processing ${configsToProcess.length} channel(s)...`);

  // Track statistics
  let remindersSent = 0;
  let remindersFailed = 0;

  // Process each configured channel
  for (const config of configsToProcess) {
    logs.push(`   ├─ Channel: #${config.channelName} | Users: ${config.users.length}`);

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
        logs.push(`   │  ❌ Failed to DM user ${userId}: ${error instanceof Error ? error.message : error}`);
        remindersFailed++;
      }
    }
  }

  // Summary
  logs.push(`   └─ Summary: ${remindersSent} sent, ${remindersFailed} failed`);
  
  // Footer
  const duration = Date.now() - startTime;
  const durationStr = duration > 1000 ? `${(duration / 1000).toFixed(2)}s` : `${duration}ms`;
  
  logs.push('-'.repeat(60));
  logs.push(`✅ [${new Date().toISOString()}] Job completed`);
  logs.push(`⏱️  Execution time: ${durationStr}`);
  
  if (duration > 5000) {
    logs.push(`⚠️  WARNING: Job took longer than 5 seconds!`);
  }
  
  logs.push('='.repeat(60));
  logs.push('');
  
  // Output everything atomically
  console.log(logs.join('\n'));
}

