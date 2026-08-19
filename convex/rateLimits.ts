import { RateLimiter, SECOND } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { auth } from "./auth";
import type { MutationCtx } from "./_generated/server";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  comment: { kind: "token bucket", rate: 1, period: 10 * SECOND, capacity: 1 },
  vote: { kind: "token bucket", rate: 1, period: SECOND, capacity: 1 },
});

export async function checkCommentRateLimit(ctx: MutationCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  await rateLimiter.limit(ctx, "comment", { key: userId, throws: true });
}

export async function checkVoteRateLimit(ctx: MutationCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  await rateLimiter.limit(ctx, "vote", { key: userId, throws: true });
}
