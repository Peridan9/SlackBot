// Event handlers (app mentions, bot joins channel, etc.)

import { App } from '@slack/bolt';

export const registerEventHandlers = (app: App, botUserId: string): void => {
  // ============================================
  // App Mention Event
  // ============================================
  
  app.event('app_mention', async ({ event, say }) => {
    await say({
      text: `Hi there <@${event.user}>! You mentioned me. How can I help?`,
      thread_ts: event.ts, // Reply in a thread to keep channel clean
    });
  });

  // ============================================
  // STEP 2: Bot Joins Channel - Welcome Message
  // ============================================
  
  app.event('member_joined_channel', async ({ event, client }) => {
    // Check if the bot itself joined the channel (auto-detected ID!)
    if (event.user === botUserId) {
      try {
        await client.chat.postMessage({
          channel: event.channel,
          text: `👋 *Hello! I'm the Daily Reports Bot!*\n\n` +
                `I help teams collect and share daily updates.\n\n` +
                `*To get started:*\n` +
                `1. A manager should DM me with: \`/setup\`\n` +
                `2. I'll guide you through configuring daily reports for this channel\n\n` +
                `Questions? Just mention me and ask!`,
        });
        console.log(`✅ Sent welcome message to channel ${event.channel}`);
      } catch (error) {
        console.error('❌ Error sending welcome message:', error);
      }
    }
  });

  // Add more event handlers here as needed
};

