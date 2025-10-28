# SlackBot - Daily Reports Automation

> ⚠️ **WORK IN PROGRESS** - This bot is currently under active development and not fully functional. See [Current Limitations](#-current-limitations) below.

A TypeScript Slack bot for automating team daily reports with scheduled reminders and aggregated summaries.

## 🎯 Current Status

### ✅ Implemented Features

**Infrastructure & Configuration:**
- ✅ `/setup` command - Interactive modal for channel configuration
- ✅ User selection, time pickers (supports :00 and :30 times)
- ✅ In-memory storage for channel configurations
- ✅ Type-safe modal handling with validation

**Scheduler System:**
- ✅ Cron-based job scheduler (runs every 30 minutes)
- ✅ Abstraction layer for easy migration to production schedulers
- ✅ Automated reminder delivery at configured times
- ✅ Report aggregation framework (structure in place)
- ✅ Performance monitoring with execution timing

**Bot Features:**
- ✅ Welcome messages when added to channels
- ✅ Basic message and event handling
- ✅ @mention responses

### 🔴 Current Limitations

**Critical Missing Feature:**
- ❌ **No report submission handler** - Users receive reminders but cannot submit reports yet!
- ❌ Report publishing shows "no reports" because submission isn't implemented

**Known Issues:**
- Log interleaving when jobs run simultaneously
- Modal time picker only shows hourly options in dropdown (users can type :30 times)
- Users in multiple channels get multiple reminder DMs

## 🚀 Setup Instructions

> ⚠️ **Note:** The bot will start and send reminders, but users cannot submit reports yet (feature in progress).

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

Create a `.env` file in the project root:

```bash
SLACK_BOT_TOKEN=xoxb-your-actual-token
SLACK_APP_TOKEN=xapp-your-actual-token
SLACK_SIGNING_SECRET=your-actual-secret
PORT=3000
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

## 🚧 What's Next

### Immediate Priority (Core Functionality)
1. **Report Submission Handler** - Allow users to submit reports via DM replies
2. Add channel context to reminder messages (show which channel the report is for)
3. Fix log interleaving (stagger job execution times)

### Phase 2: UX Improvements
- Consolidated DMs for users in multiple channels
- Improve modal time picker for :30 times
- Report editing capability
- "Skip today" option

### Phase 3: Management & Polish
- Home Tab dashboard for configuration management
- View/edit/delete channel configs
- Report history viewer
- Better error handling and user feedback

### Phase 4: Production Ready
- Persistent storage (PostgreSQL/MongoDB)
- Timezone support per channel
- Custom report questions
- Analytics and insights
- Comprehensive testing

## 🛠️ Development

- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled code
- `npm run watch` - Watch for TypeScript changes

## 📚 Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Slack Bolt SDK** - Official Slack framework for building bots
- **node-cron** - Job scheduling with cron syntax
- **Socket Mode** - No need for public URLs or webhooks
- **dotenv** - Environment variable management

## 📁 Project Structure

```
src/
├── app.ts                 # Main entry point
├── handlers/              # Event listeners
│   ├── commands.ts        # Slash commands (/setup)
│   ├── events.ts          # Slack events (mentions, joins)
│   ├── messages.ts        # Message handlers
│   └── views.ts           # Modal submissions
├── modals/                # UI components
│   └── setupModal.ts      # Setup configuration modal
├── scheduler/             # Time-based automation
│   ├── index.ts           # Scheduler entry point
│   ├── scheduler.ts       # Scheduler interface (abstraction)
│   ├── cronScheduler.ts   # node-cron implementation
│   └── jobs/              # Scheduled jobs
│       ├── sendReminders.ts
│       └── publishReports.ts
├── storage/               # Data layer
│   └── memory.ts          # In-memory storage (temporary)
└── types/                 # TypeScript definitions
    └── index.ts           # Shared types
```

## 📄 License

ISC
