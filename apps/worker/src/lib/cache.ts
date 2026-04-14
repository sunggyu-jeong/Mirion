const CACHE_BASE = "https://cache.mirion/";

function cacheRequest(key: string): Request {
  return new Request(`${CACHE_BASE}${encodeURIComponent(key)}`);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await caches.default.match(cacheRequest(key));
  if (!cached) return null;
  return cached.json() as Promise<T>;
}

export async function cachePut<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const res = new Response(JSON.stringify(value), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `max-age=${ttlSeconds}`,
    },
  });
  await caches.default.put(cacheRequest(key), res);
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    const isEmpty = Array.isArray(cached) && cached.length === 0;
    if (!isEmpty) return cached;
  }

  const fresh = await fn();
  const isEmpty = Array.isArray(fresh) && (fresh as unknown[]).length === 0;
  if (!isEmpty) {
    await cachePut(key, fresh, ttlSeconds);
  }
  return fresh;
}
