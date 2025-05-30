# Telegram Bot Error Notification Setup

This guide will help you set up Telegram bot error notifications for your Next.js application.

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Telegram Bot Configuration for Error Notifications
# =================================================

# Get your bot token from @BotFather on Telegram
# 1. Message @BotFather on Telegram
# 2. Send /newbot and follow the instructions
# 3. Copy the token provided
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Your Telegram chat ID (can be personal chat or group chat)
# To get your chat ID:
# 1. Message your bot first
# 2. Visit: https://api.telegram.org/bot<YourBOTToken>/getUpdates
# 3. Look for "chat":{"id": YOUR_CHAT_ID in the response
# OR use @userinfobot to get your chat ID
TELEGRAM_CHAT_ID=123456789

# Enable/disable Telegram notifications (true/false)
# Set to 'true' to enable error notifications via Telegram
TELEGRAM_NOTIFICATIONS_ENABLED=true
```

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided by BotFather
5. Add the token to your `.env.local` file as `TELEGRAM_BOT_TOKEN`

### 2. Get Your Chat ID

**Method 1: Using Bot API**

1. Send a message to your bot first
2. Visit: `https://api.telegram.org/bot<YourBOTToken>/getUpdates`
3. Look for `"chat":{"id": YOUR_CHAT_ID` in the response
4. Copy the chat ID

**Method 2: Using @userinfobot**

1. Search for `@userinfobot` on Telegram
2. Send `/start` command
3. It will reply with your user ID (this is your chat ID)

**Method 3: For Group Chats**

1. Add your bot to the group
2. Send a message in the group
3. Visit: `https://api.telegram.org/bot<YourBOTToken>/getUpdates`
4. Look for the group chat ID (will be negative for groups)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
TELEGRAM_CHAT_ID=your_actual_chat_id_here
TELEGRAM_NOTIFICATIONS_ENABLED=true
```

### 4. Test the Setup

Once configured, you can test the Telegram bot integration:

**Using the API endpoint:**

```bash
# Test basic functionality
curl -X GET http://localhost:3001/api/telegram/test

# Send a test message
curl -X POST http://localhost:3001/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# Test error notification
curl -X POST http://localhost:3001/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"type": "error", "message": "Test error message"}'

# Send custom message
curl -X POST http://localhost:3001/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"type": "custom", "message": "Hello from the bot!"}'
```

## Features

### Automatic Error Notifications

The system automatically sends notifications for:

- **Unhandled Promise Rejections** (server & client)
- **Uncaught Exceptions** (server-side)
- **React Error Boundary Errors** (client-side)
- **Window Errors** (client-side)
- **Manual Error Logging** (via `logError()` function)

### Error Severity Levels

- 🟡 **Low**: Minor issues, warnings
- 🟠 **Medium**: Standard errors, component failures
- 🔴 **High**: Critical errors, API failures
- 🚨 **Critical**: System-breaking errors

### Usage Examples

**Manual Error Logging:**

```typescript
import { logError } from "@/lib/error-handler";

try {
  // Your code here
} catch (error) {
  await logError(error as Error, {
    severity: "high",
    additionalData: {
      userId: user.id,
      action: "user_registration",
    },
  });
}
```

**API Route Error Handling:**

```typescript
import { handleApiError } from "@/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    // Your API logic
  } catch (error) {
    handleApiError(error as Error, request, {
      severity: "high",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**React Component with Error Boundary:**

```typescript
import { ErrorBoundary } from "@/components/error-boundary";

function MyApp() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Security Notes

- Keep your bot token secure and never commit it to version control
- Use environment variables for all sensitive configuration
- Consider using different bots for different environments (dev/staging/prod)
- The bot token gives full access to your bot, treat it like a password

## Troubleshooting

### Bot Not Receiving Messages

- Ensure `TELEGRAM_NOTIFICATIONS_ENABLED=true`
- Check that the bot token is correct
- Verify the chat ID is correct
- Make sure you've sent at least one message to the bot first

### Connection Issues

- Check your internet connection
- Verify the bot token format (should be like `123456789:ABCdefGHI...`)
- Ensure the bot hasn't been deleted or disabled

### Environment Issues

- Make sure `.env.local` is in your project root
- Restart your development server after adding environment variables
- Check that environment variables are being loaded correctly

## Production Deployment

For production deployments, make sure to:

1. Set environment variables in your hosting platform
2. Use different bot tokens for different environments
3. Consider rate limiting for error notifications
4. Monitor bot usage and Telegram API limits

## API Endpoints

- `GET /api/telegram/test` - Check bot status
- `POST /api/telegram/test` - Send test notifications

The system is now ready to send error notifications to your Telegram chat!
