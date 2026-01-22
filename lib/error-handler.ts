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
