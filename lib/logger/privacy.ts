/**
 * Privacy-Preserving Utilities for Logging
 * 
 * Anonymizes and hashes PII to comply with GDPR/CCPA while maintaining debuggability.
 */

/**
 * Hash IP address to anonymize while maintaining uniqueness for correlation
 * Uses first 3 octets + hash for /24 network anonymization
 */
export function anonymizeIP(ip: string | null): string | undefined {
  if (!ip) return undefined;

  // Remove IPv6 prefix if present (::ffff:1.2.3.4)
  const cleanIP = ip.replace(/^::ffff:/, '');

  // For IPv4: keep first 3 octets, hash the 4th
  const ipv4Match = cleanIP.match(/^(\d+\.\d+\.\d+)\.(\d+)$/);
  if (ipv4Match) {
    const network = ipv4Match[1]; // e.g., "192.168.1"
    return `${network}.xxx`; // e.g., "192.168.1.xxx"
  }

  // For IPv6: keep first 4 groups, anonymize rest
  const ipv6Match = cleanIP.match(/^([0-9a-f:]+)/i);
  if (ipv6Match) {
    const parts = cleanIP.split(':');
    if (parts.length >= 4) {
      return `${parts.slice(0, 4).join(':')}::xxxx`;
    }
  }

  return 'unknown';
}

/**
 * Parse user-agent to high-level categories (no fingerprinting)
 */
export function parseUserAgentSafe(userAgent: string | null): {
  browser: string;
  os: string;
  device: string;
  isBot: boolean;
} | undefined {
  if (!userAgent) return undefined;

  const ua = userAgent.toLowerCase();

  // Detect bots
  const isBot = /bot|crawler|spider|scraper|headless/i.test(userAgent);

  // Browser (family only, no version)
  let browser = 'other';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('edg')) browser = 'edge';

  // OS (no version)
  let os = 'other';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';

  // Device type
  let device = 'desktop';
  if (ua.includes('mobile')) device = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet';

  return { browser, os, device, isBot };
}

/**
 * Sanitize request body - remove PII, keep error-relevant fields
 */
export function sanitizeRequestBody(
  body: string | undefined,
  contentType: string | null
): Record<string, any> | string | undefined {
  if (!body) return undefined;

  // Limit size
  if (body.length > 5000) {
    body = body.substring(0, 5000) + '...[truncated]';
  }

  // For JSON, parse and redact specific fields
  if (contentType?.includes('application/json')) {
    try {
      const parsed = JSON.parse(body);
      return sanitizePIIFields(parsed);
    } catch {
      return '[Invalid JSON]';
    }
  }

  // For form data, show structure only
  if (contentType?.includes('application/x-www-form-urlencoded') || 
      contentType?.includes('multipart/form-data')) {
    return '[Form data - structure hidden for privacy]';
  }

  // For other content types, show size only
  return `[${contentType || 'unknown'} - ${body.length} bytes]`;
}

/**
 * Recursively sanitize PII fields from objects
 */
function sanitizePIIFields(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizePIIFields);
  }

  const sanitized: Record<string, any> = {};
  const piiFields = [
    'email', 'password', 'token', 'apikey', 'secret', 
    'authorization', 'cookie', 'ssn', 'phone', 'address',
    'firstname', 'lastname', 'fullname', 'name'
  ];

  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    
    // Redact PII fields
    if (piiFields.some(field => keyLower.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizePIIFields(value);
    }
  }

  return sanitized;
}

/**
 * Sanitize response body - limit to error messages only
 */
export function sanitizeResponseBody(
  body: string | undefined,
  statusCode: number
): string | undefined {
  if (!body) return undefined;

  // Only log response bodies for errors
  if (statusCode < 400) {
    return '[Success response - not logged]';
  }

  // Try to extract just the error message
  try {
    const parsed = JSON.parse(body);
    if (parsed.error || parsed.message) {
      return JSON.stringify({
        error: parsed.error || parsed.message,
        code: parsed.code,
      });
    }
  } catch {
    // Not JSON, return truncated
  }

  // Truncate
  if (body.length > 500) {
    return body.substring(0, 500) + '...[truncated]';
  }

  return body;
}
