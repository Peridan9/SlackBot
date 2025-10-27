import { App } from '@slack/bolt';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the Slack Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true, // Socket mode allows the bot to run without a public URL
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// ============================================
// STEP 1: Simple Hello Bot
// ============================================

// Respond to messages containing "hello"
app.message('hello', async ({ message, say }) => {
  // TypeScript type guard to ensure message has a user property
  if ('user' in message) {
    await say(`Hello <@${message.user}>! 👋 Nice to meet you!`);
  }
});

// Respond when someone mentions the bot with @BotName
app.event('app_mention', async ({ event, say }) => {
  await say({
    text: `Hi there <@${event.user}>! You mentioned me. How can I help?`,
    thread_ts: event.ts, // Reply in a thread to keep channel clean
  });
});

// ============================================
// Start the bot
// ============================================
(async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.start(port);
    console.log('⚡️ Slack bot is running!');
    console.log('👋 Try sending "hello" in a channel where the bot is added');
  } catch (error) {
    console.error('Failed to start the bot:', error);
    process.exit(1);
  }
})();

