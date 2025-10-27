import { App } from '@slack/bolt';
import { getChannelConfig } from '../storage/memory';
import { ChannelConfig } from '../types';

// Temporary storage for setup flows (in-memory Map)
const setupFlows = new Map<string, Partial<ChannelConfig>>();

export const registerCommandHandlers = (app: App): void => {

  // ============================================
  // STEP 2: /setup Command (Channel-Based)
  // ============================================
  app.command('/setup', async ({ command, ack, say, client }) => {
    await ack();

    const userId = command.user_id;
    const channelId = command.channel_id;

    // Check if command was run in a channel (not DM)
    if (!channelId.startsWith('C') && !channelId.startsWith('G')) {
      await say({
        text: '❌ Please run `/setup` from a channel where you want to configure daily reports, not in a DM!',
      });
      return;
    }

    // Check if channel is already configured
    const existingConfig = getChannelConfig(channelId);
    if (existingConfig) {
      await say({
        text: `⚠️ This channel is already configured!\n\nUse \`/configure\` to modify settings.`,
      });
      return;
    }

    // Get channel info
    try {
      const channelInfo = await client.conversations.info({
        channel: channelId,
      });
      
      const channelName = channelInfo.channel?.name || 'unknown';

      await say({
        text: `⚙️ <@${userId}> is setting up daily reports for <#${channelId}>!\n\nCheck your DMs for the setup wizard. 🧙‍♂️`,
      });

      // Start setup flow in DM (without metadata - keeping it simple!)
      await client.chat.postMessage({
        channel: userId,
        text: `👋 Let's set up daily reports for *#${channelName}*!\n\n` +
              `I'll ask you a few questions:\n` +
              `1️⃣ Which users should submit reports?\n` +
              `2️⃣ What time should I remind them?\n` +
              `3️⃣ What time should I publish the reports?\n\n` +
              `Let's start! 🚀\n\n` +
              `*Step 1 of 3: Users to Monitor*\n` +
              `Please reply with user mentions.\n` +
              `Example: \`@user1 @user2 @user3\``
      });

      // Store initial setup state in memory
      setupFlows.set(userId, {
        channelId: channelId,
        channelName: channelName,
        createdBy: userId,
      });

      console.log(`✅ Setup initiated by ${userId} for channel ${channelId} (#${channelName})`);
    } catch (error) {
      console.error('❌ Error in /setup command:', error);
      await say({
        text: `Sorry <@${userId}>, something went wrong. Make sure I have access to this channel!`,
      });
    }
  });

  // ============================================
  // STEP 4: /configure Command (Coming Soon!)
  // ============================================
  app.command('/configure', async ({ command, ack, say }) => {
    await ack();
    
    await say({
      text: `🚧 The \`/configure\` command is coming soon!\n\n` +
            `It will let you:\n` +
            `• View all configured channels\n` +
            `• Edit users to monitor\n` +
            `• Change reminder and report times`,
    });
  });
};

// Export setupFlows for use in message handlers (Step 3)
export { setupFlows };
