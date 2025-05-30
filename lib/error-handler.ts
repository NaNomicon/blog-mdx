import { notifyError } from './telegram';
import type { ErrorContext } from './telegram/types';

// Global error handler for unhandled errors
export function setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    if (typeof window === 'undefined') {
        // Server-side
        process.on('unhandledRejection', (reason, promise) => {
            const error = reason instanceof Error ? reason : new Error(String(reason));
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);

            notifyError(error, {
                severity: 'high',
                environment: process.env.NODE_ENV,
                additionalData: {
                    type: 'unhandledRejection',
                    promise: promise.toString(),
                },
            });
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);

            notifyError(error, {
                severity: 'critical',
                environment: process.env.NODE_ENV,
                additionalData: {
                    type: 'uncaughtException',
                },
            });

            // Don't exit the process in development
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            }
        });
    } else {
        // Client-side
        window.addEventListener('error', (event) => {
            const error = event.error || new Error(event.message);

            notifyError(error, {
                severity: 'medium',
                url: window.location.href,
                userAgent: navigator.userAgent,
                environment: process.env.NODE_ENV,
                additionalData: {
                    type: 'windowError',
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                },
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

            notifyError(error, {
                severity: 'high',
                url: window.location.href,
                userAgent: navigator.userAgent,
                environment: process.env.NODE_ENV,
                additionalData: {
                    type: 'unhandledRejection',
                },
            });
        });
    }
}

// Custom error logger for manual error reporting
export async function logError(
    error: Error,
    context?: ErrorContext
): Promise<void> {
    // Log to console
    console.error('Error logged:', error);

    // Send to Telegram
    await notifyError(error, {
        ...context,
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
    });
}

// Error boundary helper for React components
export function createErrorHandler(componentName: string) {
    return (error: Error, errorInfo: any) => {
        console.error(`Error in ${componentName}:`, error, errorInfo);

        logError(error, {
            severity: 'medium',
            additionalData: {
                component: componentName,
                errorInfo,
            },
        });
    };
}

// API route error handler
export function handleApiError(
    error: Error,
    req?: any,
    context?: Partial<ErrorContext>
): void {
    const errorContext: ErrorContext = {
        url: req?.url,
        userAgent: req?.headers?.['user-agent'],
        severity: 'high',
        additionalData: {
            method: req?.method,
            headers: req?.headers,
            query: req?.query,
            body: req?.body,
        },
        ...context,
    };

    logError(error, errorContext);
}

// Next.js specific error handler
export function handleNextError(
    error: Error,
    req?: any,
    res?: any,
    context?: Partial<ErrorContext>
): void {
    const errorContext: ErrorContext = {
        url: req?.url,
        userAgent: req?.headers?.['user-agent'],
        severity: 'high',
        additionalData: {
            method: req?.method,
            statusCode: res?.statusCode,
            headers: req?.headers,
        },
        ...context,
    };

    logError(error, errorContext);
} 