import { getLogger } from '@/lib/logger/wide-event-logger';
import type { LogContext } from '@/lib/logger/types';

// Error Context Interface
interface ErrorContext {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    url?: string;
    userAgent?: string;
    environment?: string;
    additionalData?: Record<string, any>;
}

// Custom error logger for manual error reporting
export async function logError(
    error: Error,
    context?: ErrorContext
): Promise<void> {
    // Log to console
    console.error('Error logged:', error);

    // Optional: Log context if provided
    if (context) {
        console.error('Error context:', context);
    }

    // Send to Axiom if available (server-side only)
    if (typeof window === 'undefined' && process.env.AXIOM_TOKEN) {
        try {
            const logger = getLogger();
            const logContext: LogContext = {
                environment: context?.environment || process.env.NODE_ENV,
                userAgent: context?.userAgent,
                route: context?.url,
            };

            await logger.logEvent({
                eventName: 'application_error',
                timestamp: new Date().toISOString(),
                status: 'error',
                error: {
                    message: error.message,
                    stack: error.stack,
                    code: (error as any).code,
                    details: context?.additionalData,
                },
                context: logContext,
                tags: ['error', context?.severity || 'medium'],
            });

            await logger.flush();
        } catch (axiomError) {
            console.error('[Axiom] Failed to log error:', axiomError);
        }
    }
}

// Error boundary helper for React components
export function createErrorHandler(componentName: string) {
    return (error: Error, errorInfo: any) => {
        console.error(`Error in ${componentName}:`, error, errorInfo);

        logError(error, {
            severity: 'medium',
            additionalData: {
                component: componentName,
                errorInfo: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });
    };
}
