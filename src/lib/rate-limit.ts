import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function checkRateLimit(
  identifier: string,
  type: "auth" | "api" = "api"
): Promise<{ success: boolean; remaining: number }> {
  const limiter = type === "auth" ? authLimiter : apiLimiter;
  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
