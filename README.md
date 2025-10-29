# SlackBot - Daily Reports Automation

> ✅ **FUNCTIONAL MVP** - Core features are complete and working! The bot can schedule reminders, collect reports, and aggregate them. See [What's Next](#-whats-next) for upcoming enhancements.

A TypeScript Slack bot for automating team daily reports with scheduled reminders and aggregated summaries.

## 🎯 Current Status

### ✅ Implemented Features

**Core Functionality:**
- ✅ `/setup` command - Configure daily reports for any channel
- ✅ `/report` command - Submit reports via interactive modal
- ✅ Automated reminder DMs at configured times
- ✅ Automated report aggregation and publishing
- ✅ Time precision: 30-minute intervals (:00 and :30)

**Home Tab Dashboard:**
- ✅ Personal section showing channels you report to
- ✅ Real-time submission status (✅ Submitted / ⏳ Pending)
- ✅ Admin dashboard for managing channel configurations
- ✅ Edit channel settings (opens pre-filled modal)
- ✅ Delete channels with confirmation
- ✅ Quick stats and analytics

**User Experience:**
- ✅ Multi-channel support - select which channel to report to
- ✅ Report validation (10-1000 characters)
- ✅ Edit reports (resubmit to update)
- ✅ Confirmation messages with dynamic "submitted" vs "updated" text
- ✅ Channel context in reminders (shows which channel)
- ✅ Crown badge (👑) for channels you both manage and report to

**Technical Excellence:**
- ✅ TypeScript with full type safety
- ✅ Modular architecture (handlers, modals, scheduler, storage)
- ✅ Clean, atomic scheduler logs (no interleaving)
- ✅ Performance monitoring with execution timing
- ✅ Edge case handling throughout
- ✅ Abstraction layer for easy database migration

### ⚠️ Current Limitations

**Temporary Constraints:**
- In-memory storage (reports lost on restart - by design for MVP)
- No timezone support (uses server time)
- No report history viewer yet
- Single DM per channel (working as designed, consolidation planned)

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
   - `app_mentions:read` - detect @mentions
   - `chat:write` - send messages and DMs
   - `channels:history` - read messages in channels
   - `im:history` - read direct messages
   - `users:read` - fetch user information for reports
   - `commands` - enable slash commands (/setup, /report)

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
   - `app_mention` - respond to @mentions
   - `message.channels` - listen to channel messages
   - `app_home_opened` - enable Home Tab dashboard

#### Register Slash Commands:
1. Go to **Slash Commands**
2. Click **"Create New Command"**
3. Add `/setup`:
   - Command: `/setup`
   - Request URL: (not needed with Socket Mode)
   - Short Description: "Configure daily reports for this channel"
4. Add `/report`:
   - Command: `/report`
   - Request URL: (not needed with Socket Mode)
   - Short Description: "Submit your daily report"

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

**Basic Functionality:**
1. Invite the bot to a channel: `/invite @YourBotName`
2. Send a message: `hello`
3. The bot should respond: `Hello @you! 👋 Nice to meet you!`
4. Or mention it: `@YourBotName`

**Configure Daily Reports:**
5. In a channel, type `/setup`
6. Fill in the modal:
   - Select users to monitor
   - Set reminder time (when to ask for reports)
   - Set report time (when to publish reports)
7. Submit and wait for the configured times!

**Submit Reports:**
8. When you get a reminder DM, type `/report`
9. Select the channel and write your report
10. Submit and get confirmation

**Manage Configurations:**
11. Click on the bot's name → Go to **Home** tab
12. View your channels and submission status
13. If you're an admin, edit or delete channel configs

## 🚧 What's Next

### Phase 2: Enhanced UX
- **Consolidated Multi-Channel DMs** - Send one DM with multiple buttons when user is in multiple channels
- **Report History Viewer** - Browse past reports in Home Tab
- **Pre-fill Report Editing** - Edit existing reports instead of retyping
- **Skip Today Option** - Allow users to mark days as skipped
- **Better Analytics** - Submission rates, trends, missing reports

### Phase 3: Production Ready
- **Persistent Storage** - Migrate to PostgreSQL or MongoDB
- **Timezone Support** - Per-channel timezone configuration
- **Custom Questions** - Define custom report fields per channel
- **Export Features** - Download reports as CSV
- **Advanced Permissions** - Role-based access control
- **Comprehensive Testing** - Unit and integration tests

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
├── app.ts                      # Main entry point
├── handlers/                   # Event listeners
│   ├── commands.ts             # Slash commands (/setup, /report)
│   ├── events.ts               # Slack events (mentions, joins)
│   ├── messages.ts             # Message handlers
│   ├── views.ts                # Modal submissions (setup, report, delete)
│   └── home.ts                 # Home Tab dashboard & actions
├── modals/                     # UI components
│   ├── setupModal.ts           # Setup/edit configuration modal
│   ├── reportModal.ts          # Report submission modal
│   └── confirmDeleteModal.ts   # Delete confirmation modal
├── scheduler/                  # Time-based automation
│   ├── index.ts                # Scheduler entry point
│   ├── scheduler.ts            # Scheduler interface (abstraction)
│   ├── cronScheduler.ts        # node-cron implementation
│   └── jobs/                   # Scheduled jobs
│       ├── sendReminders.ts    # Send reminder DMs
│       └── publishReports.ts   # Aggregate and publish reports
├── storage/                    # Data layer
│   └── memory.ts               # In-memory storage (MVP)
└── types/                      # TypeScript definitions
    └── index.ts                # Shared types (ChannelConfig, DailyReport)
```

## 📄 License

ISC
