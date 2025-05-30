import { initializeTelegramNotifier } from './bot';
import { setupGlobalErrorHandling } from '../error-handler';

// Initialize Telegram bot for error notifications
export function initializeTelegramErrorNotifications() {
    const config = {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
        enabled: process.env.TELEGRAM_NOTIFICATIONS_ENABLED === 'true' &&
            Boolean(process.env.TELEGRAM_BOT_TOKEN) &&
            Boolean(process.env.TELEGRAM_CHAT_ID),
    };

    if (config.enabled) {
        console.log('Initializing Telegram error notifications...');
        const notifier = initializeTelegramNotifier(config);

        // Test connection only
        notifier.testConnection().then((success) => {
            if (success) {
                console.log('✅ Telegram bot connection successful');
            } else {
                console.log('❌ Telegram bot connection failed');
            }
        });
    } else {
        console.log('Telegram error notifications disabled or not configured');
    }

    // Setup global error handling
    setupGlobalErrorHandling();
}

// Environment variables validation
export function validateTelegramConfig(): {
    isValid: boolean;
    missingVars: string[];
} {
    const requiredVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    return {
        isValid: missingVars.length === 0,
        missingVars,
    };
} 