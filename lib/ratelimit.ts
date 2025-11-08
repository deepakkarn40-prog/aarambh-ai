type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

// Very simple token bucket limiter per key (e.g., IP)
// capacity: max tokens, refillPerSec: tokens per second
export function allow(key: string, capacity = 30, refillPerSec = 0.5) {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: capacity, last: now };
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}
