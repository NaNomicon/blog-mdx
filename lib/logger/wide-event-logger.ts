/**
 * Wide-Event Logger with Decorator Pattern
 * 
 * Implements the wide-event logging pattern: single JSON event per operation with full context.
 * Use this to wrap use cases and automatically capture timing, inputs, outputs, and errors.
 */

import { Logger } from 'next-axiom';
import type { WideLogEvent, LogContext, SanitizationConfig } from './types';

/**
 * Sanitizes data by redacting sensitive fields and limiting depth/size
 */
export function sanitizeData(
  data: any,
  config: SanitizationConfig = {}
): any {
  const {
    redactFields = ['password', 'token', 'apiKey', 'secret', 'authorization'],
    maxStringLength = 1000,
    maxDepth = 5,
  } = config;

  function sanitize(value: any, depth: number): any {
    if (depth > maxDepth) return '[Max Depth Exceeded]';
    if (value === null || value === undefined) return value;

    // Handle primitives
    if (typeof value === 'string') {
      return value.length > maxStringLength
        ? value.substring(0, maxStringLength) + '...[truncated]'
        : value;
    }
    if (typeof value !== 'object') return value;

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, depth + 1));
    }

    // Handle objects
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (redactFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(val, depth + 1);
      }
    }
    return sanitized;
  }

  return sanitize(data, 0);
}

/**
 * Creates a wide-event logger instance
 */
export class WideEventLogger {
  private logger: Logger;
  private sanitizationConfig: SanitizationConfig;

  constructor(config?: { logger?: Logger; sanitization?: SanitizationConfig }) {
    this.logger = config?.logger || new Logger();
    this.sanitizationConfig = config?.sanitization || {};
  }

  /**
   * Logs a wide event to Axiom
   */
  async logEvent(event: WideLogEvent): Promise<void> {
    const sanitizedEvent = {
      ...event,
      input: event.input ? sanitizeData(event.input, this.sanitizationConfig) : undefined,
      output: event.output ? sanitizeData(event.output, this.sanitizationConfig) : undefined,
    };

    const level = event.status === 'error' ? 'error' : event.status === 'warning' ? 'warn' : 'info';
    
    this.logger.log(
      level as any,
      sanitizedEvent.eventName,
      sanitizedEvent as any
    );

    // Flush immediately if it's an error
    if (event.status === 'error') {
      await this.logger.flush();
    }
  }

  /**
   * Decorator pattern: wraps a function with wide-event logging
   */
  wrap<TInput extends any[], TOutput>(
    eventName: string,
    fn: (...args: TInput) => Promise<TOutput>,
    options?: {
      context?: LogContext;
      extractInput?: (...args: TInput) => Record<string, any>;
      extractOutput?: (result: TOutput) => Record<string, any>;
    }
  ): (...args: TInput) => Promise<TOutput> {
    return async (...args: TInput): Promise<TOutput> => {
      const startTime = Date.now();
      const timestamp = new Date().toISOString();
      const context = options?.context || {};

      try {
        const result = await fn(...args);
        const durationMs = Date.now() - startTime;

        await this.logEvent({
          eventName,
          timestamp,
          status: 'success',
          durationMs,
          input: options?.extractInput ? options.extractInput(...args) : undefined,
          output: options?.extractOutput ? options.extractOutput(result) : undefined,
          context,
        });

        return result;
      } catch (error) {
        const durationMs = Date.now() - startTime;

        await this.logEvent({
          eventName,
          timestamp,
          status: 'error',
          durationMs,
          input: options?.extractInput ? options.extractInput(...args) : undefined,
          error: {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            details: error && typeof error === 'object' ? { ...error } : undefined,
          },
          context,
        });

        throw error;
      }
    };
  }

  /**
   * Flush all pending logs
   */
  async flush(): Promise<void> {
    await this.logger.flush();
  }
}

/**
 * Global logger instance (server-side only)
 */
let globalLogger: WideEventLogger | null = null;

export function getLogger(): WideEventLogger {
  if (!globalLogger) {
    globalLogger = new WideEventLogger();
  }
  return globalLogger;
}
