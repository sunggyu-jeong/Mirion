import type { CexTradeDTO } from "../types";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;

const SYMBOL_LABEL: Record<string, string> = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  SOLUSDT: "SOL/USDT",
  BNBUSDT: "BNB/USDT",
  XRPUSDT: "XRP/USDT",
};

const MIN_USD_VALUE = 100_000;
const LOOKBACK_MS = 90_000;

interface BinanceAggTrade {
  a: number;
  p: string;
  q: string;
  T: number;
  m: boolean;
}

async function fetchSymbolLargeTrades(symbol: string): Promise<CexTradeDTO[]> {
  const res = await fetch(
    `https://api.binance.com/api/v3/aggTrades?symbol=${symbol}&limit=500`,
  );
  if (!res.ok) return [];

  const raw = (await res.json()) as BinanceAggTrade[];
  const cutoff = Date.now() - LOOKBACK_MS;

  return raw
    .filter((t) => {
      const valueUsd = parseFloat(t.p) * parseFloat(t.q);
      return t.T >= cutoff && valueUsd >= MIN_USD_VALUE;
    })
    .map((t) => {
      const price = parseFloat(t.p);
      const amount = parseFloat(t.q);
      return {
        symbol: SYMBOL_LABEL[symbol] ?? symbol,
        side: t.m ? "sell" : "buy",
        price,
        amount,
        valueUsd: price * amount,
        timestampMs: t.T,
      };
    });
}

export async function fetchAllLargeCexTrades(): Promise<CexTradeDTO[]> {
  const results = await Promise.allSettled(
    SYMBOLS.map((s) => fetchSymbolLargeTrades(s)),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
