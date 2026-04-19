// KV-backed cache (global across all CF datacenters)
export async function kvGet<T>(kv: KVNamespace, key: string): Promise<T | null> {
  return kv.get<T>(key, "json");
}

export async function kvPut<T>(
  kv: KVNamespace,
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
}

export async function withKvCache<T>(
  kv: KVNamespace,
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await kvGet<T>(kv, key);
  if (cached !== null) {
    const isEmpty = Array.isArray(cached) && (cached as unknown[]).length === 0;
    if (!isEmpty) return cached;
  }
  const fresh = await fn();
  const isEmpty = Array.isArray(fresh) && (fresh as unknown[]).length === 0;
  if (!isEmpty) {
    await kvPut(kv, key, fresh, ttlSeconds);
  }
  return fresh;
}
