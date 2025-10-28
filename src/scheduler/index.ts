// Scheduler Entry Point
// Sets up and starts all scheduled jobs for the bot

import { App } from '@slack/bolt';
import { CronScheduler } from './cronScheduler';
import { sendRemindersJob } from './jobs/sendReminders';
import { publishReportsJob } from './jobs/publishReports';

// Singleton instance
let schedulerInstance: CronScheduler | null = null;

/**
 * Start the scheduler with all configured jobs
 * @param app The Slack Bolt app instance
 */
export function startScheduler(app: App): void {
  if (schedulerInstance) {
    console.warn('⚠️  Scheduler already running. Stopping existing scheduler first.');
    stopScheduler();
  }

  console.log('🚀 Starting scheduler...');
  
  // Create scheduler instance
  schedulerInstance = new CronScheduler();

  // ============================================
  // Schedule Jobs
  // ============================================

  // Job 1: Send daily reminders (runs every hour)
  // Checks if any channels are configured for the current hour
  schedulerInstance.scheduleJob(
    'hourly-reminders-check',
    '* * * * *', // Every hour at minute 0
    async () => await sendRemindersJob(app)
  );

  // Job 2: Publish daily reports (runs every hour)
  // Checks if any channels are configured for the current hour
  schedulerInstance.scheduleJob(
    'hourly-reports-check',
    '* * * * *', // Every hour at minute 0
    async () => await publishReportsJob(app)
  );

  console.log('✅ Scheduler started successfully!');
  console.log('📋 Active jobs:', schedulerInstance.getActiveJobs());
  console.log('');
  console.log('Cron Schedule:');
  console.log('  • Reminders: Checked every hour');
  console.log('  • Reports: Checked every hour');
  console.log('');
}

/**
 * Stop the scheduler and all jobs
 */
export function stopScheduler(): void {
  if (schedulerInstance) {
    console.log('🛑 Stopping scheduler...');
    schedulerInstance.stopAll();
    schedulerInstance = null;
    console.log('✅ Scheduler stopped');
  } else {
    console.log('ℹ️  Scheduler is not running');
  }
}

/**
 * Get the current scheduler instance
 */
export function getScheduler(): CronScheduler | null {
  return schedulerInstance;
}

