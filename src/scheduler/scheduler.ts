// Scheduler interface - defines the contract for any scheduler implementation
// This abstraction allows us to swap scheduler implementations without changing business logic

export interface IScheduler {
  /**
   * Schedule a recurring job using cron syntax
   * @param name Unique identifier for the job
   * @param cronTime Cron expression (e.g., '0 9 * * *' for 9 AM daily)
   * @param callback Function to execute when the job triggers
   */
  scheduleJob(name: string, cronTime: string, callback: () => Promise<void>): void;

  /**
   * Stop a specific scheduled job
   * @param name Name of the job to stop
   */
  stopJob(name: string): void;

  /**
   * Stop all scheduled jobs (useful for shutdown)
   */
  stopAll(): void;
}

