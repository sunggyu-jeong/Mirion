import { fetchAllLargeCexTrades } from "../lib/binance";
import type { CexTradeDTO, Env } from "../types";

const KV_KEY = "cex-trades:recent";
const MAX_TRADES = 50;
const TTL_SECONDS = 3_600;

export async function handleGetCexTrades(env: Env): Promise<Response> {
  const raw = await env.CACHE.get(KV_KEY);
  const trades: CexTradeDTO[] = raw ? (JSON.parse(raw) as CexTradeDTO[]) : [];
  return Response.json(trades);
}

export async function handleIngestCexTrade(
  request: Request,
  env: Env,
): Promise<Response> {
  const secret = env.CEX_INGEST_SECRET;
  if (secret) {
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const trade = (await request.json()) as CexTradeDTO;

  const raw = await env.CACHE.get(KV_KEY);
  const existing: CexTradeDTO[] = raw ? (JSON.parse(raw) as CexTradeDTO[]) : [];
  const updated = [trade, ...existing].slice(0, MAX_TRADES);

  await env.CACHE.put(KV_KEY, JSON.stringify(updated), {
    expirationTtl: TTL_SECONDS,
  });

  return Response.json({ ok: true });
}

export async function handlePollCexTrades(env: Env): Promise<void> {
  const newTrades = await fetchAllLargeCexTrades();
  if (newTrades.length === 0) return;

  const raw = await env.CACHE.get(KV_KEY);
  const existing: CexTradeDTO[] = raw ? (JSON.parse(raw) as CexTradeDTO[]) : [];

  const existingKeys = new Set(
    existing.map((t) => `${t.symbol}-${t.timestampMs}`),
  );
  const unique = newTrades.filter(
    (t) => !existingKeys.has(`${t.symbol}-${t.timestampMs}`),
  );

  if (unique.length === 0) return;

  const updated = [...unique, ...existing]
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .slice(0, MAX_TRADES);

  await env.CACHE.put(KV_KEY, JSON.stringify(updated), {
    expirationTtl: TTL_SECONDS,
  });
}
