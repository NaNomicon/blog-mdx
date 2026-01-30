# PRD: Wide-Event Logging & Observability

**Status**: ✅ Implemented (v1)  
**Owner**: Engineering  
**Last Updated**: 2026-01-30  

## Problem Statement

Debugging production issues requires reconstructing user actions and system state. Traditional log-line-per-action approaches create noise and make correlation difficult. We need:

1. **Debuggability**: Reproduce issues without access to production
2. **Performance Visibility**: Identify slow operations and bottlenecks
3. **User Journey Tracking**: Trace multi-step flows across requests
4. **Privacy Compliance**: Automatic redaction of sensitive data

## Solution: Wide-Event Logging with Axiom

Implement the "wide-event" pattern: **single JSON event per operation with full context**.

### Core Principle
Instead of multiple log lines:
```
[INFO] User viewed post
[INFO] Database query took 42ms
[INFO] Response sent
```

One structured event:
```json
{
  "eventName": "blog_view_recorded",
  "timestamp": "2026-01-30T21:45:00Z",
  "status": "success",
  "durationMs": 42,
  "requestId": "req_abc123",
  "sessionId": "ses_xyz789",
  "input": { "slug": "example-post" },
  "output": { "isNewView": true },
  "context": { "userId": "anon_123", "browser": "Chrome", "device": "mobile" }
}
```

## Requirements

### Functional Requirements

#### FR1: HTTP Error Logging
- **MUST** log all 4xx/5xx responses
- **MUST** include: request ID, trace ID, method, path, query params, headers
- **MUST** capture request and response bodies (with size limits)
- **SHOULD** parse user-agent into structured data

#### FR2: Application Error Logging
- **MUST** log all exceptions with stack traces
- **MUST** include severity levels (low, medium, high, critical)
- **MUST** capture error context (component, route, user action)
- **SHOULD** flush errors immediately (no batching)

#### FR3: Convex Event Logging
- **MUST** log all mutations (success AND errors)
- **MUST** include timing, inputs, outputs
- **MUST** track session ID for correlation
- **SHOULD** NOT block mutation execution

#### FR4: Request Correlation
- **MUST** generate unique request ID per HTTP request
- **MUST** propagate request ID to downstream operations
- **MUST** include session ID for multi-request user journeys
- **SHOULD** support trace ID for distributed tracing

#### FR5: Privacy & Security
- **MUST** auto-redact sensitive fields (password, token, apiKey, secret, email, phone, address, name)
- **MUST** anonymize IP addresses to /24 network (e.g., 192.168.1.xxx)
- **MUST** parse user-agents to high-level categories only (no fingerprinting)
- **MUST** sanitize request/response bodies to remove PII
- **MUST** limit string length (max 5000 chars for bodies, 1000 chars for fields)
- **MUST** limit object depth (max 5 levels) to prevent circular refs
- **MUST NOT** log user PII without explicit consent
- **MUST NOT** log full IP addresses, raw user-agents, or unsanitized form data

**Privacy-Preserving Techniques:**
1. **IP Anonymization**: `192.168.1.234` → `192.168.1.xxx` (preserves /24 network for debugging)
2. **User-Agent Parsing**: Full string → `{ browser: "chrome", os: "macos", device: "desktop" }`
3. **Request Body Sanitization**: Redact email, password, phone, etc. → `[REDACTED]`
4. **Response Body Filtering**: Only log error messages, not full responses
5. **Form Data Hiding**: `[Form data - structure hidden for privacy]` instead of values

### Non-Functional Requirements

#### NFR1: Performance
- Logging **MUST NOT** add >5ms to request latency
- Convex logging **MUST** be asynchronous (non-blocking)
- HTTP middleware **SHOULD** only log errors (not all requests)

#### NFR2: Cost Efficiency
- **MUST** stay within Axiom free tier (500 GB/month)
- **SHOULD** sample high-traffic events if needed
- **SHOULD** compress events before sending

#### NFR3: Reliability
- Failed logging **MUST NOT** crash the application
- **SHOULD** retry failed log uploads (max 3 attempts)
- **SHOULD** fall back to console.log if Axiom unavailable

## Technical Design

### Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  middleware.ts                      │
│  - Generate requestId               │
│  - Log 4xx/5xx responses            │
│  - Capture req/res bodies           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  App Components                     │
│  - Use getLogger() for manual logs  │
│  - Wrap functions with .wrap()      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Convex Mutations                   │
│  - logConvexEvent() wrapper         │
│  - Async HTTP API calls             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Axiom Cloud                        │
│  - 30-day retention                 │
│  - Columnar storage (ClickHouse)    │
│  - APL query language               │
└─────────────────────────────────────┘
```

### Implementation Components

| Component | File | Purpose |
|-----------|------|---------|
| Types | `lib/logger/types.ts` | WideLogEvent, LogContext interfaces |
| Core Logger | `lib/logger/wide-event-logger.ts` | Decorator pattern, sanitization |
| HTTP Middleware | `middleware.ts` | Request correlation, error logging |
| Error Handler | `lib/error-handler.ts` | Application error integration |
| Convex Logger | `convex/axiom-logger.ts` | Backend event logging via HTTP API |
| Instrumentation | `instrumentation.ts` | Server initialization hook |

### Event Schema

```typescript
interface WideLogEvent {
  // Core metadata
  eventName: string;
  timestamp: string;  // ISO 8601
  status: 'success' | 'error' | 'warning';
  durationMs?: number;

  // Correlation
  requestId?: string;
  traceId?: string;
  sessionId?: string;

  // Operation data
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };

  // Context
  context?: {
    userId?: string;
    userAgent?: ParsedUserAgent;
    route?: string;
    environment?: string;
  };

  // Metadata
  tags?: string[];
}
```

## Configuration

### Environment Variables

```bash
# Required for logging
AXIOM_TOKEN="xaat-..."  # Get from https://axiom.co/settings
NEXT_PUBLIC_AXIOM_DATASET="blog-events"

# Optional
NODE_ENV="production"  # Affects log filtering
```

### Axiom Free Tier Limits

- **Ingest**: 500 GB/month
- **Storage**: 25 GB
- **Query Compute**: 10 GB-hours/month
- **Retention**: 30 days

**Estimated Capacity**: ~16M events/month (assuming 30KB/event after compression)

## Success Metrics

### Phase 1 (MVP)
- ✅ HTTP errors logged with request correlation
- ✅ Application errors captured with stack traces
- ✅ Convex events tracked (views, reactions)
- ✅ Privacy: Sensitive fields auto-redacted

### Phase 2 (Current)
- 🚧 Request/trace IDs for journey reconstruction
- 🚧 Parsed user-agent for device filtering
- 🚧 Session ID tracking across operations
- 🚧 Request/response body capture on errors

### Phase 3 (Future)
- ⏳ Performance baselines (P50/P95 tracking)
- ⏳ Sampling for high-traffic events
- ⏳ Integration with error alerting (Sentry, PagerDuty)
- ⏳ Custom dashboards for business metrics

## Privacy & GDPR Compliance

### Data Minimization

We implement **privacy by design** to minimize PII collection:

| Data Type | What We Log | What We DON'T Log | Why |
|-----------|-------------|-------------------|-----|
| **IP Address** | `/24 network` (e.g., `192.168.1.xxx`) | Full IP (e.g., `192.168.1.234`) | GDPR PII - anonymized for debugging |
| **User-Agent** | Parsed categories (`{browser: "chrome", os: "macos"}`) | Full string | Prevents fingerprinting |
| **Request Body** | Sanitized structure | Emails, passwords, phone numbers | Remove all PII fields |
| **Response Body** | Error messages only | Full success responses | Only errors need debugging |
| **Form Data** | Structure indicator | Field values | Assume all form data is sensitive |
| **User ID** | Pseudonymous Convex ID | Real names, emails | Already anonymized |

### Retention & Deletion

- **Axiom Free Tier**: 30-day automatic deletion
- **Paid Tier** (if upgraded): Configure retention, recommend 90 days max
- **Right to Erasure**: User data automatically purged after retention period

### Legal Basis (GDPR Article 6)

Our logging is justified under:
- **Legitimate Interest** (Article 6(1)(f)): Debugging and security monitoring
- **Balancing Test**: Minimal PII + anonymization + short retention = proportionate

### Privacy Policy Disclosure

**Recommended language for privacy policy:**

> We collect anonymized technical logs for debugging and security purposes. This includes:
> - Anonymized IP addresses (network-level, not individual)
> - Browser and device type (e.g., "Chrome on mobile")
> - Error messages (no personal content)
> 
> Data is retained for 30 days and automatically deleted. We do not sell or share this data.

### CCPA Compliance

- **No Sale of Data**: Logs are internal-only, not shared with third parties
- **Do Not Track**: Anonymous users already have minimal tracking
- **Right to Delete**: Covered by 30-day auto-deletion

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Exceed free tier quota | High | Only log errors, implement sampling |
| Logging adds latency | Medium | Async logging, flush in background |
| PII leakage | High | Auto-redaction, regular audits |
| Circular references crash logger | Low | Max depth limit (5 levels) |
| Axiom outage breaks app | Medium | Fail silently, fall back to console |

## Open Questions

1. **Sampling Strategy**: If we exceed 500GB/month, what events to sample?
   - Proposal: Sample successful operations at 10%, always log errors
2. **Alerting**: Should we integrate with Sentry for real-time alerts?
   - Deferred to Phase 3
3. **Convex Auth Session**: Can we extract session ID from Convex auth?
   - Yes - use `auth.getUserId()` as session identifier

## References

- [Axiom Documentation](https://axiom.co/docs)
- [Wide-Event Logging Pattern](https://www.honeycomb.io/blog/event-foo-constructing-a-complete-event)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- PRD: Convex Views & Reactions (`03-convex-views-reactions.md`)
