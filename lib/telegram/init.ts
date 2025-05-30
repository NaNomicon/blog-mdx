import { initializeTelegramNotifier } from './bot';
import { setupGlobalErrorHandling } from '../error-handler';
import { env, validateTelegramConfig } from '../env';

// Initialize Telegram bot for error notifications
export function initializeTelegramErrorNotifications() {
    const config = {
        botToken: env.TELEGRAM_BOT_TOKEN || '',
        chatId: env.TELEGRAM_CHAT_ID || '',
        enabled: env.TELEGRAM_NOTIFICATIONS_ENABLED &&
            Boolean(env.TELEGRAM_BOT_TOKEN) &&
            Boolean(env.TELEGRAM_CHAT_ID),
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

// Re-export the new validation function for backward compatibility
export { validateTelegramConfig }; 