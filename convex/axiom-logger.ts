/**
 * Axiom Logger Wrapper for Convex Mutations
 * 
 * Provides wide-event logging for Convex backend operations.
 * Since Convex runs in its own runtime, we use the HTTP API to send events.
 */

/**
 * Logs an event to Axiom via HTTP API (for Convex runtime)
 * 
 * @param eventName - Name of the event
 * @param status - Status of the operation
 * @param data - Additional data to log
 */
export async function logConvexEvent(
  eventName: string,
  status: 'success' | 'error' | 'warning',
  data?: {
    durationMs?: number;
    input?: Record<string, any>;
    output?: Record<string, any>;
    error?: { message: string; stack?: string };
    context?: Record<string, any>;
  }
): Promise<void> {
  // Only log if Axiom is configured
  const token = process.env.AXIOM_TOKEN;
  const dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET || 'blog-events';

  const event = {
    eventName,
    timestamp: new Date().toISOString(),
    status,
    ...data,
    source: 'convex',
    environment: process.env.NODE_ENV || 'development',
    context: {
      ...data?.context,
      // SessionId is already passed in data.context from calling code
    },
  };

  // Console logging in development only
  if (process.env.NODE_ENV !== 'production') {
    const logFn = status === 'error' ? console.error : status === 'warning' ? console.warn : console.log;
    logFn(`[Convex] ${eventName} (${status})`, {
      durationMs: data?.durationMs,
      input: data?.input,
      output: data?.output,
      error: data?.error?.message,
    });
  }

  if (!token) {
    return;
  }

  try {
    // Send to Axiom via HTTP API
    await fetch(`https://api.axiom.co/v1/datasets/${dataset}/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([event]),
    });
  } catch (error) {
    // Silently fail - don't break Convex mutations if logging fails
    console.error('[Axiom] Failed to log event:', error);
  }
}

/**
 * Decorator for Convex mutations with automatic logging
 * 
 * @example
 * const myMutation = withLogging(
 *   'user_action',
 *   mutation({
 *     args: { id: v.string() },
 *     handler: async (ctx, args) => {
 *       // your logic
 *     }
 *   })
 * );
 */
export function withLogging<TArgs, TOutput>(
  eventName: string,
  handler: (ctx: any, args: TArgs) => Promise<TOutput>
): (ctx: any, args: TArgs) => Promise<TOutput> {
  return async (ctx: any, args: TArgs): Promise<TOutput> => {
    const startTime = Date.now();

    try {
      const result = await handler(ctx, args);
      const durationMs = Date.now() - startTime;

      // Log success asynchronously (don't await)
      logConvexEvent(eventName, 'success', {
        durationMs,
        input: sanitizeConvexInput(args),
        output: sanitizeConvexOutput(result),
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log error asynchronously (don't await)
      logConvexEvent(eventName, 'error', {
        durationMs,
        input: sanitizeConvexInput(args),
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      throw error;
    }
  };
}

/**
 * Sanitizes Convex input for logging (redacts sensitive fields)
 */
function sanitizeConvexInput(args: any): Record<string, any> {
  if (!args || typeof args !== 'object') return {};

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(args)) {
    // Redact sensitive fields
    if (key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Sanitizes Convex output for logging
 */
function sanitizeConvexOutput(result: any): Record<string, any> | undefined {
  if (result === null || result === undefined) return undefined;
  
  // For simple return values, just log the type
  if (typeof result !== 'object') {
    return { type: typeof result, value: String(result).substring(0, 100) };
  }

  // For objects, include basic info
  return { type: 'object', keys: Object.keys(result) };
}
