// Message event handlers

import { App } from '@slack/bolt';

export const registerMessageHandlers = (app: App): void => {
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

  // Add more message handlers here as the bot grows
};

