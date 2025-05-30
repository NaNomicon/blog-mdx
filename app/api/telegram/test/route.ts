import { NextRequest, NextResponse } from 'next/server';
import { getTelegramNotifier, sendTelegramMessage, initializeTelegramNotifier } from '@/lib/telegram';
import { logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type = 'test', message } = body;

        let notifier = getTelegramNotifier();

        // If notifier is not initialized, try to initialize it
        if (!notifier) {
            const config = {
                botToken: process.env.TELEGRAM_BOT_TOKEN || '',
                chatId: process.env.TELEGRAM_CHAT_ID || '',
                enabled: process.env.TELEGRAM_NOTIFICATIONS_ENABLED === 'true' &&
                    Boolean(process.env.TELEGRAM_BOT_TOKEN) &&
                    Boolean(process.env.TELEGRAM_CHAT_ID),
            };

            if (config.enabled) {
                notifier = initializeTelegramNotifier(config);
            }
        }

        if (!notifier) {
            return NextResponse.json(
                { error: 'Telegram bot not initialized - check environment variables' },
                { status: 500 }
            );
        }

        let result = false;

        switch (type) {
            case 'test':
                result = await sendTelegramMessage(
                    `🧪 **Test Message**\n\nTelegram bot is working correctly!\n\n**Time:** ${new Date().toISOString()}\n**Environment:** ${process.env.NODE_ENV}`
                );
                break;

            case 'error':
                // Test error notification
                const testError = new Error(message || 'This is a test error');
                await logError(testError, {
                    severity: 'low',
                    additionalData: {
                        type: 'test',
                        source: 'API test endpoint',
                    },
                });
                result = true; // logError doesn't return a boolean, so we assume success
                break;

            case 'custom':
                if (!message) {
                    return NextResponse.json(
                        { error: 'Message is required for custom type' },
                        { status: 400 }
                    );
                }
                result = await sendTelegramMessage(message);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid type. Use: test, error, or custom' },
                    { status: 400 }
                );
        }

        if (result) {
            return NextResponse.json({
                success: true,
                message: 'Telegram notification sent successfully'
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send Telegram notification' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in Telegram test endpoint:', error);

        // Log this error too
        if (error instanceof Error) {
            await logError(error, {
                severity: 'medium',
                additionalData: {
                    endpoint: '/api/telegram/test',
                    method: 'POST',
                },
            });
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        let notifier = getTelegramNotifier();

        // If notifier is not initialized, try to initialize it
        if (!notifier) {
            const config = {
                botToken: process.env.TELEGRAM_BOT_TOKEN || '',
                chatId: process.env.TELEGRAM_CHAT_ID || '',
                enabled: process.env.TELEGRAM_NOTIFICATIONS_ENABLED === 'true' &&
                    Boolean(process.env.TELEGRAM_BOT_TOKEN) &&
                    Boolean(process.env.TELEGRAM_CHAT_ID),
            };

            if (config.enabled) {
                notifier = initializeTelegramNotifier(config);
            }
        }

        if (!notifier) {
            return NextResponse.json({
                configured: false,
                message: 'Telegram bot not initialized - check environment variables',
                debug: {
                    hasToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
                    hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
                    enabled: process.env.TELEGRAM_NOTIFICATIONS_ENABLED,
                }
            });
        }

        const connectionTest = await notifier.testConnection();

        return NextResponse.json({
            configured: true,
            connected: connectionTest,
            message: connectionTest
                ? 'Telegram bot is configured and connected'
                : 'Telegram bot is configured but connection failed',
        });

    } catch (error) {
        console.error('Error checking Telegram bot status:', error);

        return NextResponse.json({
            configured: false,
            connected: false,
            message: 'Error checking Telegram bot status',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
} 