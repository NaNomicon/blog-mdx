export interface TelegramConfig {
    botToken: string;
    chatId: string;
    enabled: boolean;
}

export interface ErrorNotification {
    error: Error;
    context?: {
        url?: string;
        userAgent?: string;
        userId?: string;
        timestamp?: Date;
        environment?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        additionalData?: Record<string, any>;
    };
}

export interface ErrorContext {
    url?: string;
    userAgent?: string;
    userId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    additionalData?: Record<string, any>;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationResult {
    success: boolean;
    message?: string;
    error?: string;
} 