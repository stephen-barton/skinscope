const windows = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (windows.get(key) ?? []).filter(
    (t) => t > now - windowMs
  );

  if (timestamps.length >= limit) {
    windows.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  windows.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length };
}
