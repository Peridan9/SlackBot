// CronScheduler - Implementation of IScheduler using node-cron
// This is the ONLY file that imports node-cron, keeping the dependency isolated

import cron from 'node-cron';
import { IScheduler } from './scheduler';

export class CronScheduler implements IScheduler {
  private jobs = new Map<string, cron.ScheduledTask>();

  /**
   * Schedule a recurring job using cron syntax
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

    // Create the scheduled task with error handling and timing
    const task = cron.schedule(cronTime, async () => {
      const startTime = Date.now();
      const timestamp = new Date().toISOString();
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 [${timestamp}] Starting job: ${name}`);
      console.log(`${'='.repeat(60)}`);
      
      try {
        await callback();
        
        const duration = Date.now() - startTime;
        const durationStr = duration > 1000 
          ? `${(duration / 1000).toFixed(2)}s` 
          : `${duration}ms`;
        
        console.log(`${'='.repeat(60)}`);
        console.log(`✅ [${new Date().toISOString()}] Job '${name}' completed`);
        console.log(`⏱️  Execution time: ${durationStr}`);
        
        // Warn if job takes too long
        if (duration > 5000) {
          console.warn(`⚠️  WARNING: Job took longer than 5 seconds!`);
        }
        
        console.log(`${'='.repeat(60)}\n`);
      } catch (error) {
        const duration = Date.now() - startTime;
        const durationStr = duration > 1000 
          ? `${(duration / 1000).toFixed(2)}s` 
          : `${duration}ms`;
        
        console.log(`${'='.repeat(60)}`);
        console.error(`❌ [${new Date().toISOString()}] Job '${name}' FAILED`);
        console.error(`⏱️  Execution time before error: ${durationStr}`);
        console.error(`💥 Error:`, error);
        console.log(`${'='.repeat(60)}\n`);
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

