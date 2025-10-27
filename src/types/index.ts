// TypeScript type definitions for the Slack bot

export interface ChannelConfig {
  channelId: string;
  channelName?: string; // Optional: Store channel name for easier reference
  reportFormat: string[];
  users: string[]; // Array of user IDs to monitor
  reminderTime: string; // Format: "HH:MM" (e.g., "09:00") - When to ask for reports
  reportTime: string; // Format: "HH:MM" (e.g., "17:00") - When to publish reports
  createdBy: string; // User ID of who set it up
  createdAt: Date;
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
  dmThreadTs?: string; // For tracking DM conversation
}

