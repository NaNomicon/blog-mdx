/**
 * Next.js Middleware for Axiom Logging
 * 
 * Logs HTTP errors (4xx/5xx responses) to Axiom with full context.
 * Privacy-preserving: anonymizes IPs, sanitizes bodies, parses user-agents.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Logger } from 'next-axiom';
import { 
  anonymizeIP, 
  parseUserAgentSafe, 
  sanitizeRequestBody, 
  sanitizeResponseBody 
} from '@/lib/logger/privacy';

export async function middleware(request: NextRequest) {
  // Only log if Axiom is configured
  if (!process.env.AXIOM_TOKEN) {
    return NextResponse.next();
  }

  const logger = new Logger();
  const startTime = Date.now();

  // Generate unique request ID for correlation
  const requestId = crypto.randomUUID();
  const traceId = request.headers.get('x-trace-id') || crypto.randomUUID();

  // Process the request
  const response = NextResponse.next();
  
  // Add request ID to response headers for client correlation
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-trace-id', traceId);

  // Log only errors (4xx/5xx)
  const status = response.status;
  if (status >= 400) {
    const durationMs = Date.now() - startTime;

    // Privacy-preserving data collection
    const rawIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const anonymizedIP = anonymizeIP(rawIP);
    const rawUserAgent = request.headers.get('user-agent');
    const parsedUserAgent = parseUserAgentSafe(rawUserAgent);
    const contentType = request.headers.get('content-type');

    // Capture request body for POST/PUT/PATCH (sanitized for privacy)
    let requestBody: any;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const clonedRequest = request.clone();
        const text = await clonedRequest.text();
        requestBody = sanitizeRequestBody(text, contentType);
      } catch {
        requestBody = '[Unable to capture request body]';
      }
    }

    // Capture response body (sanitized - error messages only)
    let responseBody: any;
    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      responseBody = sanitizeResponseBody(text, status);
    } catch {
      responseBody = '[Unable to capture response body]';
    }

    // Console logging in development only
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[Middleware] HTTP ${status}: ${request.method} ${request.nextUrl.pathname}`,
        {
          requestId,
          durationMs,
          userAgent: parsedUserAgent,
          ip: anonymizedIP,
        }
      );
    }

    logger.logHttpRequest(
      status >= 500 ? logger.error as any : logger.warn as any,
      `HTTP ${status}: ${request.method} ${request.nextUrl.pathname}`,
      request,
      {
        // Correlation IDs
        requestId,
        traceId,
        
        // Request details
        statusCode: status,
        durationMs,
        path: request.nextUrl.pathname,
        method: request.method,
        query: Object.fromEntries(request.nextUrl.searchParams),
        
        // Privacy-preserving user info
        userAgent: parsedUserAgent, // Parsed, not raw
        ip: anonymizedIP, // Anonymized to /24 network
        referer: request.headers.get('referer'),
        contentType,
        
        // Sanitized bodies (PII redacted)
        requestBody,
        responseBody,
      }
    );

    // Flush errors immediately
    await logger.flush();
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
