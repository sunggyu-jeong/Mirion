import type { Env, WhaleTxDTO } from "../types";

const MIN_VALUE_USD = 20_000;
const KV_TTL = 30 * 60;
const MAX_TXS = 200;
const RECENCY_MS = 90 * 24 * 60 * 60 * 1000;

export async function handleIngestWhaleTx(request: Request, env: Env): Promise<Response> {
  const secret = env.INGEST_SECRET;
  if (secret) {
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { chain, txs } = (await request.json()) as { chain: string; txs: WhaleTxDTO[] };
  if (!chain || !Array.isArray(txs) || txs.length === 0) {
    return Response.json({ ok: true, added: 0 });
  }

  const cacheKey = `radar:v2:${chain}:${MIN_VALUE_USD}`;
  const existing = (await env.CACHE.get<WhaleTxDTO[]>(cacheKey, "json")) ?? [];

  const existingHashes = new Set(existing.map((t) => t.txHash));
  const cutoff = Date.now() - RECENCY_MS;

  const newTxs = txs.filter((t) => !existingHashes.has(t.txHash) && t.timestampMs >= cutoff);
  if (newTxs.length === 0) return Response.json({ ok: true, added: 0 });

  const merged = [...newTxs, ...existing]
    .filter((t) => t.timestampMs >= cutoff)
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .slice(0, MAX_TXS);

  await env.CACHE.put(cacheKey, JSON.stringify(merged), { expirationTtl: KV_TTL });

  return Response.json({ ok: true, added: newTxs.length });
}
