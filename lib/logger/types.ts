/**
 * Wide-Event Logging Types
 * 
 * Based on the wide-event logging pattern: all context in a single JSON event.
 * Enables debugging without reproduction, performance analysis, and full traceability.
 */

export type LogStatus = 'success' | 'error' | 'warning';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  userAgent?: string | ParsedUserAgent;
  ip?: string;
  route?: string;
  environment?: string;
  version?: string;
  [key: string]: any;
}

export interface ParsedUserAgent {
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  device?: string;
  isBot?: boolean;
  raw: string;
}

export interface WideLogEvent {
  // Core event metadata
  eventName: string;
  timestamp: string;
  status: LogStatus;
  durationMs?: number;

  // Operation context
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
    details?: Record<string, any>;
  };

  // Request context
  context?: LogContext;

  // Additional metadata
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SanitizationConfig {
  /** Fields to redact (e.g., passwords, tokens) */
  redactFields?: string[];
  
  /** Maximum string length for truncation */
  maxStringLength?: number;
  
  /** Maximum depth for nested objects */
  maxDepth?: number;
}
