import type { Env } from "../types";

export interface WhaleEntry {
  id: string;
  name: string;
  address: string;
  tag: string;
  chain: "ETH" | "BTC" | "SOL" | "BNB";
  isLocked: boolean;
}

const KV_KEY = "whale-list";

const DEFAULT_WHALES: WhaleEntry[] = [
  {
    id: "vitalik",
    name: "Vitalik Buterin",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    tag: "ETH 창시자",
    chain: "ETH",
    isLocked: false,
  },
  {
    id: "microstrategy",
    name: "MicroStrategy",
    address: "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6",
    tag: "기관 투자자",
    chain: "BTC",
    isLocked: false,
  },
  {
    id: "sol-foundation",
    name: "Solana Foundation",
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    tag: "재단",
    chain: "SOL",
    isLocked: false,
  },
  {
    id: "jump-crypto",
    name: "Jump Crypto",
    address: "0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef",
    tag: "헤지펀드",
    chain: "ETH",
    isLocked: true,
  },
  {
    id: "binance",
    name: "Binance Hot Wallet",
    address: "0x28C6c06298d514Db089934071355E5743bf21d60",
    tag: "거래소",
    chain: "ETH",
    isLocked: true,
  },
  {
    id: "grayscale",
    name: "Grayscale",
    address: "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",
    tag: "ETF 운용사",
    chain: "BTC",
    isLocked: true,
  },
  {
    id: "wintermute",
    name: "Wintermute",
    address: "0x4f3a120E72C76c22ae802D129F599BFDbc31cb81",
    tag: "마켓메이커",
    chain: "ETH",
    isLocked: true,
  },
  {
    id: "sol-whale-1",
    name: "익명 SOL 고래",
    address: "CakcnaRDHka2gXyfxNhasEVFjeSAMJkDquQQjrkG41M8",
    tag: "대형 투자자",
    chain: "SOL",
    isLocked: true,
  },
  {
    id: "bnb-binance",
    name: "Binance BNB 재단",
    address: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
    tag: "거래소",
    chain: "BNB",
    isLocked: true,
  },
];

export async function handleGetWhales(
  _request: Request,
  env: Env,
): Promise<Response> {
  const cached = await env.CACHE.get<WhaleEntry[]>(KV_KEY, "json");

  if (cached) {
    return Response.json(cached);
  }

  await env.CACHE.put(KV_KEY, JSON.stringify(DEFAULT_WHALES), {
    expirationTtl: 86400,
  });

  return Response.json(DEFAULT_WHALES);
}
