import { redis } from "./redis";

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

export async function rateLimit(key: string, limit = 10, window = 60): Promise<RateLimitResult> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${key}:${Math.floor(now / window)}`;
    const count = await redis.incr(windowKey);
    if (count === 1) await redis.expire(windowKey, window);
    if (count > limit) {
      return { success: false, retryAfter: window - (now % window) };
    }
    return { success: true };
  } catch {
    // If Redis is unavailable, fail open to avoid blocking users
    return { success: true };
  }
}
