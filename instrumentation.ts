/**
 * Next.js Instrumentation File
 * 
 * This file is called once per server instance to initialize observability tools.
 * Runs before any request handling begins.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Axiom] Instrumentation initialized - logs will be sent via middleware');
  }
}
