import { Bot } from 'grammy';
import type { TelegramConfig, ErrorNotification } from './types';
import { env } from '../env';

class TelegramNotifier {
    private bot: Bot | null = null;
    private config: TelegramConfig;

    constructor(config: TelegramConfig) {
        this.config = config;

        if (this.config.enabled && this.config.botToken) {
            try {
                this.bot = new Bot(this.config.botToken);
            } catch (error) {
                console.error('Failed to initialize Telegram bot:', error);
            }
        }
    }

    private formatErrorMessage(notification: ErrorNotification): string {
        const { error, context } = notification;
        const timestamp = context?.timestamp || new Date();
        const environment = context?.environment || env.NODE_ENV || 'unknown';
        const severity = context?.severity || 'medium';

        const severityEmoji = {
            low: '🟡',
            medium: '🟠',
            high: '🔴',
            critical: '🚨'
        };

        let message = `${severityEmoji[severity]} **Error Alert**\n\n`;
        message += `**Environment:** ${environment}\n`;
        message += `**Time:** ${timestamp.toISOString()}\n`;
        message += `**Error:** ${error.name}\n`;
        message += `**Message:** ${error.message}\n`;

        if (context?.url) {
            message += `**URL:** ${context.url}\n`;
        }

        if (context?.userAgent) {
            message += `**User Agent:** ${context.userAgent}\n`;
        }

        if (context?.userId) {
            message += `**User ID:** ${context.userId}\n`;
        }

        if (error.stack) {
            // Truncate stack trace to avoid message length limits
            const stackTrace = error.stack.substring(0, 1000);
            message += `\n**Stack Trace:**\n\`\`\`\n${stackTrace}\n\`\`\``;
        }

        if (context?.additionalData) {
            message += `\n**Additional Data:**\n\`\`\`json\n${JSON.stringify(context.additionalData, null, 2).substring(0, 500)}\n\`\`\``;
        }

        return message;
    }

    async sendErrorNotification(notification: ErrorNotification): Promise<boolean> {
        if (!this.bot || !this.config.enabled) {
            console.log('Telegram bot not configured or disabled');
            return false;
        }

        try {
            const message = this.formatErrorMessage(notification);

            await this.bot.api.sendMessage(this.config.chatId, message, {
                parse_mode: 'Markdown',
            });

            return true;
        } catch (error) {
            console.error('Failed to send Telegram notification:', error);
            return false;
        }
    }

    async sendCustomMessage(message: string): Promise<boolean> {
        if (!this.bot || !this.config.enabled) {
            return false;
        }

        try {
            await this.bot.api.sendMessage(this.config.chatId, message, {
                parse_mode: 'Markdown',
            });
            return true;
        } catch (error) {
            console.error('Failed to send custom Telegram message:', error);
            return false;
        }
    }

    // Test the bot connection
    async testConnection(): Promise<boolean> {
        if (!this.bot || !this.config.enabled) {
            return false;
        }

        try {
            const me = await this.bot.api.getMe();
            console.log(`Telegram bot connected: @${me.username}`);
            return true;
        } catch (error) {
            console.error('Telegram bot connection test failed:', error);
            return false;
        }
    }
}

// Singleton instance
let telegramNotifier: TelegramNotifier | null = null;

export function initializeTelegramNotifier(config: TelegramConfig): TelegramNotifier {
    telegramNotifier = new TelegramNotifier(config);
    return telegramNotifier;
}

export function getTelegramNotifier(): TelegramNotifier | null {
    return telegramNotifier;
}

// Convenience function for quick error notifications
export async function notifyError(
    error: Error,
    context?: ErrorNotification['context']
): Promise<boolean> {
    const notifier = getTelegramNotifier();
    if (!notifier) {
        console.warn('Telegram notifier not initialized');
        return false;
    }

    return await notifier.sendErrorNotification({ error, context });
}

// Convenience function for custom messages
export async function sendTelegramMessage(message: string): Promise<boolean> {
    const notifier = getTelegramNotifier();
    if (!notifier) {
        console.warn('Telegram notifier not initialized');
        return false;
    }

    return await notifier.sendCustomMessage(message);
}

export { TelegramNotifier }; 