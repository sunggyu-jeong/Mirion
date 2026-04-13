export async function withCache<T>(
  kv: KVNamespace,
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await kv.get<T>(key, "json");
  if (cached !== null) {
    const isEmpty = Array.isArray(cached) && cached.length === 0;
    if (!isEmpty) return cached;
  }

  const fresh = await fn();
  const isEmpty = Array.isArray(fresh) && (fresh as unknown[]).length === 0;
  if (!isEmpty) {
    await kv.put(key, JSON.stringify(fresh), { expirationTtl: ttlSeconds });
  }
  return fresh;
}
