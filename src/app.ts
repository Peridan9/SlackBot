import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { registerMessageHandlers } from './handlers/messages';
import { registerEventHandlers } from './handlers/events';
import { registerCommandHandlers } from './handlers/commands';

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
// Start the Bot
// ============================================

(async () => {
  try {
    // Start the app first
    const port = Number(process.env.PORT) || 3000;
    await app.start(port);
    
    console.log('⚡️ Slack bot is running!');
    
    // ============================================
    // Auto-detect Bot User ID
    // ============================================
    
    // Call auth.test to get bot's user ID automatically
    const authTest = await app.client.auth.test();
    const botUserId = authTest.user_id as string;
    const botName = authTest.user as string;
    
    console.log(`🤖 Bot User ID: ${botUserId}`);
    console.log(`📛 Bot Name: ${botName}`);
    
    // ============================================
    // Register All Handlers (with bot info)
    // ============================================
    
    registerMessageHandlers(app);
    registerEventHandlers(app, botUserId);
    registerCommandHandlers(app);
    
    console.log('📂 Project structure: organized and modular');
    console.log('👋 Try sending "hello" in a channel where the bot is added');
    console.log('➕ Or invite the bot to a channel to see the welcome message!');
  } catch (error) {
    console.error('❌ Failed to start the bot:', error);
    process.exit(1);
  }
})();
