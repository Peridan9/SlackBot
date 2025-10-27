// In-memory data storage layer
// This can be easily swapped for file-based or database storage later

import { ChannelConfig, DailyReport } from '../types';

// Storage Maps
const channelConfigs = new Map<string, ChannelConfig>();
const dailyReports = new Map<string, DailyReport[]>(); // channelId -> reports[]

// ============================================
// Channel Configuration Functions
// ============================================

export const saveChannelConfig = (config: ChannelConfig): void => {
  channelConfigs.set(config.channelId, config);
  console.log(`✅ Saved config for channel ${config.channelId}`);
};

export const getChannelConfig = (channelId: string): ChannelConfig | undefined => {
  return channelConfigs.get(channelId);
};

export const getAllChannelConfigs = (): ChannelConfig[] => {
  return Array.from(channelConfigs.values());
};

export const deleteChannelConfig = (channelId: string): boolean => {
  return channelConfigs.delete(channelId);
};

// ============================================
// Daily Reports Functions
// ============================================

export const saveDailyReport = (channelId: string, report: DailyReport): void => {
  const reports = dailyReports.get(channelId) || [];
  reports.push(report);
  dailyReports.set(channelId, reports);
  console.log(`✅ Saved report from ${report.userName} for channel ${channelId}`);
};

export const getTodayReports = (channelId: string): DailyReport[] => {
  const reports = dailyReports.get(channelId) || [];
  const today = new Date().toDateString();
  
  return reports.filter(report => 
    report.timestamp.toDateString() === today
  );
};

export const clearTodayReports = (channelId: string): void => {
  const reports = dailyReports.get(channelId) || [];
  const today = new Date().toDateString();
  
  const filtered = reports.filter(report => 
    report.timestamp.toDateString() !== today
  );
  
  dailyReports.set(channelId, filtered);
  console.log(`🗑️  Cleared today's reports for channel ${channelId}`);
};

export const getAllReports = (channelId: string): DailyReport[] => {
  return dailyReports.get(channelId) || [];
};

// ============================================
// Helper Functions
// ============================================

export const isChannelConfigured = (channelId: string): boolean => {
  return channelConfigs.has(channelId);
};

export const getStorageStats = () => {
  return {
    totalChannels: channelConfigs.size,
    totalReports: Array.from(dailyReports.values()).reduce((sum, reports) => sum + reports.length, 0),
  };
};

