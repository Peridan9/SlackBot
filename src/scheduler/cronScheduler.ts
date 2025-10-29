// CronScheduler - Implementation of IScheduler using node-cron
// This is the ONLY file that imports node-cron, keeping the dependency isolated

import cron from 'node-cron';
import { IScheduler } from './scheduler';

export class CronScheduler implements IScheduler {
  private jobs = new Map<string, cron.ScheduledTask>();

  /**
   * Schedule a recurring job using cron syntax
   * The job callback is responsible for ALL logging (headers, content, footers)
   */
  scheduleJob(name: string, cronTime: string, callback: () => Promise<void>): void {
    // Validate cron expression
    if (!cron.validate(cronTime)) {
      throw new Error(`Invalid cron expression: ${cronTime}`);
    }

    // Check if job already exists
    if (this.jobs.has(name)) {
      console.warn(`⚠️  Job '${name}' already exists. Stopping existing job first.`);
      this.stopJob(name);
    }

    // Create the scheduled task - SILENT wrapper, jobs handle their own logging
    const task = cron.schedule(cronTime, async () => {
      try {
        // Run the job - it handles ALL output atomically
        await callback();
      } catch (error) {
        // Only log unhandled crashes (jobs should handle their own errors)
        console.error(`\n💥 CRITICAL: Job '${name}' crashed unexpectedly:`, error);
      }
    });

    // Store the task reference
    this.jobs.set(name, task);
    console.log(`📅 Scheduled job '${name}' with cron: ${cronTime}`);
  }

  /**
   * Stop a specific scheduled job
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`🛑 Stopped job: ${name}`);
    } else {
      console.warn(`⚠️  Job '${name}' not found`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    console.log(`🛑 Stopping all ${this.jobs.size} scheduled jobs...`);
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`  - Stopped: ${name}`);
    });
    this.jobs.clear();
    console.log('✅ All jobs stopped');
  }

  /**
   * Get list of active job names
   */
  getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}

