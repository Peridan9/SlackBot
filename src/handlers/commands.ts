import { App } from '@slack/bolt';

export const registerCommandHandlers = (app: App): void => {

    app.command('/setup', async ({command, ack, say, client}) => {
        await ack();

        const userId = command.user_id;
        const userName = command.user_name;

        await say(`⚙️ <@${userId}> started setup! Check your DMs for next steps.`);

        try {
            await client.chat.postMessage({
              channel: userId,  // Send DM to user
              text: `👋 Hi there! Let's set up your daily reports bot.\n\n` +
                    `I'm still learning, but soon I'll help you:\n` +
                    `• Configure which channel to monitor\n` +
                    `• Set up report questions\n` +
                    `• Choose when to collect reports\n\n` +
                    `Stay tuned! 🚀`
            });

            console.log(`✅ Setup command processed by ${userName}`);
        } catch (error) {
            console.error('❌ Error sending DM:', error);
            await say(`Sorry <@${userId}>, I couldn't send you a DM. Make sure DMs are enabled!`);
        }
    });
  
  // Future commands will go here!
};
