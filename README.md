# SlackBot

A TypeScript Slack bot for collecting and posting daily reports.

## 🎯 Current Status: Setup & Configuration Complete

Right now, this bot can:
- ✅ Respond with "hello" when someone sends a message containing "hello"
- ✅ Respond when mentioned with @BotName
- ✅ Send welcome message when added to a channel
- ✅ `/setup` command - Configure daily reports via modal
- ✅ Store channel configurations in memory
- ✅ Type-safe modal handling with proper validation

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Name it (e.g., "Daily Reports Bot") and select your workspace

### 3. Configure Your Slack App

#### Enable Socket Mode:
1. Go to **Settings** → **Socket Mode**
2. Enable it
3. Create an **App-Level Token** with `connections:write` scope
4. Copy this token (starts with `xapp-`) - you'll need it as `SLACK_APP_TOKEN`

#### Add Bot Scopes:
1. Go to **OAuth & Permissions**
2. Under **Bot Token Scopes**, add:
   - `app_mentions:read` - to detect @mentions
   - `chat:write` - to send messages
   - `channels:history` - to read messages in channels
   - `im:history` - to read direct messages (optional)

#### Install to Workspace:
1. Still in **OAuth & Permissions**, click **"Install to Workspace"**
2. Authorize the app
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`) - you'll need it as `SLACK_BOT_TOKEN`

#### Get Signing Secret:
1. Go to **Settings** → **Basic Information**
2. Under **App Credentials**, find **Signing Secret**
3. Copy it - you'll need it as `SLACK_SIGNING_SECRET`

#### Subscribe to Events:
1. Go to **Event Subscriptions**
2. Enable Events
3. Under **Subscribe to bot events**, add:
   - `app_mention`
   - `message.channels`

### 4. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your actual tokens
# SLACK_BOT_TOKEN=xoxb-your-actual-token
# SLACK_APP_TOKEN=xapp-your-actual-token
# SLACK_SIGNING_SECRET=your-actual-secret
```

### 5. Run the Bot

```bash
# Development mode (auto-reload on changes)
npm run dev

# Or build and run in production mode
npm run build
npm start
```

### 6. Test the Bot

1. Invite the bot to a channel: `/invite @YourBotName`
2. Send a message: `hello`
3. The bot should respond: `Hello @you! 👋 Nice to meet you!`
4. Or mention it: `@YourBotName`
5. Try `/setup` in a channel to configure daily reports

## 📝 Next Steps

### Phase 1: Scheduler & Core Functionality
- [ ] Build scheduler infrastructure
- [ ] Send daily reminders to monitored users
- [ ] Collect user report submissions
- [ ] Publish daily reports to configured channels

### Phase 2: Management UI (Home Tab)
- [ ] Create Home Tab dashboard
- [ ] View all configured channels
- [ ] Edit channel settings
- [ ] View report history
- [ ] Better UX than slash commands

### Phase 3: Enhancements
- [ ] Persistent storage (database/file-based)
- [ ] Timezone support
- [ ] Custom report questions
- [ ] Analytics and insights

## 🛠️ Development

- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled code
- `npm run watch` - Watch for TypeScript changes

## 📚 Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Slack Bolt SDK** - Official Slack framework
- **Socket Mode** - No need for public URLs or webhooks
- **dotenv** - Environment variable management
