// TypeScript type definitions for the Slack bot

export interface ChannelConfig {
  channelId: string;
  reportFormat: string[];
  users: string[];
  reportTime: string; // Format: "HH:MM" (e.g., "09:00")
}

export interface DailyReport {
  userId: string;
  userName: string;
  report: string;
  timestamp: Date;
}

export interface UserReportStatus {
  userId: string;
  hasSubmitted: boolean;
}

