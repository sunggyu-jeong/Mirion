import type { Env } from "../types";

export interface WhaleEntry {
  id: string;
  name: string;
  address: string;
  tag: string;
  chain: "ETH" | "BTC" | "SOL" | "BNB" | "XRP" | "TRX";
  isLocked: boolean;
}

const KV_KEY = "whale-list";

const DEFAULT_WHALES: WhaleEntry[] = [
  // ── ETH (26개) ────────────────────────────────────────────────────────────
  { id: "vitalik",          name: "Vitalik Buterin",     address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", tag: "ETH 창시자",   chain: "ETH", isLocked: false },
  { id: "eth-foundation",   name: "Ethereum Foundation", address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe", tag: "재단",        chain: "ETH", isLocked: true },
  { id: "binance-eth-1",    name: "Binance Hot 1",       address: "0x28C6c06298d514Db089934071355E5743bf21d60", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "binance-eth-2",    name: "Binance Hot 2",       address: "0xF977814e90dA44bFA03b6295A0616a897441aceC", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "binance-eth-cold", name: "Binance Cold",        address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "coinbase-eth-1",   name: "Coinbase 1",          address: "0x71660c4005BA85c37ccec55d0C4493E66Fe775d3", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "coinbase-eth-2",   name: "Coinbase 2",          address: "0x503828976D22510aad0201ac7EC88293211D23Da", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "coinbase-eth-3",   name: "Coinbase 3",          address: "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "coinbase-prime",   name: "Coinbase Prime",      address: "0x3cD751E6b0078Be393132286c442345e5DC49699", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "kraken-eth-1",     name: "Kraken 1",            address: "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "kraken-eth-4",     name: "Kraken 4",            address: "0x0A869d79a7052C7f1b55a8EbAbbEa3420F0D1E13", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "okx-eth-1",        name: "OKX 1",               address: "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "okx-eth-2",        name: "OKX 2",               address: "0x98EC059Dc3aDFBdd63429454aeB0c990FBA4A128", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "gemini-eth-1",     name: "Gemini 1",            address: "0xd24400ae8BfEBb18cA49Be86258a3C749cf46853", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "gemini-eth-2",     name: "Gemini 2",            address: "0x6FC82a5fe25A5cDb58bc74600A40A69C065263f8", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "huobi-eth-1",      name: "HTX (Huobi) 1",       address: "0xaB5C66752a9e8167967685F1450532fB96d5d24f", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "huobi-eth-2",      name: "HTX (Huobi) 2",       address: "0x46705dfff24256421A05D056c29E81Bdc09723B8", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "bybit-eth-1",      name: "Bybit 1",             address: "0xf89d7b9c864f589bbF53a82105107622B35EaA40", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "bybit-eth-2",      name: "Bybit 2",             address: "0x77134cbC06cB00b66F4c7e623D5fdBF6777635EC", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "kucoin-eth",       name: "KuCoin",              address: "0x2B5634C42055806a59e9107ED44D43c426E58258", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "gate-eth",         name: "Gate.io",             address: "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "upbit-eth",        name: "Upbit",               address: "0x61189Da79177950A7272C88c6058b96d4bcd6be2", tag: "거래소",      chain: "ETH", isLocked: true },
  { id: "cumberland",       name: "Cumberland DRW",      address: "0x5f65f7b609678448494De4C87521CdF6cEf1e932", tag: "마켓메이커",  chain: "ETH", isLocked: true },
  { id: "jump-crypto",      name: "Jump Crypto",         address: "0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef", tag: "헤지펀드",    chain: "ETH", isLocked: true },

  // ── BTC (10개) ────────────────────────────────────────────────────────────
  { id: "binance-btc-cold", name: "Binance Cold",        address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",        tag: "거래소",      chain: "BTC", isLocked: false },
  { id: "microstrategy",    name: "MicroStrategy",       address: "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6", tag: "기관 투자자", chain: "BTC", isLocked: true },
  { id: "grayscale",        name: "Grayscale GBTC",      address: "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ",        tag: "ETF 운용사",  chain: "BTC", isLocked: true },
  { id: "bitfinex-btc",     name: "Bitfinex Cold",       address: "3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r",        tag: "거래소",      chain: "BTC", isLocked: true },
  { id: "binance-btc-hot",  name: "Binance Hot",         address: "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s",        tag: "거래소",      chain: "BTC", isLocked: true },
  { id: "coinbase-btc",     name: "Coinbase",            address: "3Cbq7aT1tY8kMxWLbitaG7yT6bPbKChq64",        tag: "거래소",      chain: "BTC", isLocked: true },
  { id: "huobi-btc",        name: "HTX (Huobi)",         address: "1HckjUpRGcrrRAtFaaCAUaGjsPx9oYmLaZ",        tag: "거래소",      chain: "BTC", isLocked: true },
  { id: "bybit-btc",        name: "Bybit",               address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", tag: "거래소",      chain: "BTC", isLocked: true },

  // ── SOL (12개) ────────────────────────────────────────────────────────────
  { id: "sol-foundation",   name: "Solana Foundation",   address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", tag: "재단",      chain: "SOL", isLocked: false },
  { id: "sol-binance",      name: "Binance SOL",         address: "5tzFkiKscXHK5ZXCGbxZVsATsG2q5kq7RhT1P4vcJRPk", tag: "거래소",    chain: "SOL", isLocked: true },
  { id: "sol-coinbase",     name: "Coinbase SOL",        address: "H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS", tag: "거래소",    chain: "SOL", isLocked: true },
  { id: "sol-kraken",       name: "Kraken SOL",          address: "FWznbcNXWQuHTawe9RxvQ2LdCENVDTyyzqZFQ6Hh82TA", tag: "거래소",    chain: "SOL", isLocked: true },
  { id: "sol-bybit",        name: "Bybit SOL",           address: "A77HErqtfN1hLLpvZ9pGtu19jfScNKSuLBUwg7BqNMqb", tag: "거래소",    chain: "SOL", isLocked: true },
  { id: "sol-kucoin",       name: "KuCoin SOL",          address: "BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4", tag: "거래소",    chain: "SOL", isLocked: true },
  { id: "sol-gate",         name: "Gate.io SOL",         address: "rGrHmFZ8ymHkmijmSmkLGx1R3JXvHnVrTTRr8WBHGVD",  tag: "거래소",    chain: "SOL", isLocked: true },
  { id: "sol-jump",         name: "Jump Trading SOL",    address: "3QpJ3j1vq1PfqJdvCcHKWQg9bGLBKcKsMQMnMFgBsKoB", tag: "헤지펀드",  chain: "SOL", isLocked: true },
  { id: "sol-whale-1",      name: "익명 SOL 고래 1",      address: "CakcnaRDHka2gXyfxNhasEVFjeSAMJkDquQQjrkG41M8", tag: "대형 투자자", chain: "SOL", isLocked: true },
  { id: "sol-whale-2",      name: "익명 SOL 고래 2",      address: "7cnh5YfKBCgHoHLBJm3CkT5PoGVNg4o3SZBzHqGJWhDr", tag: "대형 투자자", chain: "SOL", isLocked: true },
  { id: "sol-whale-3",      name: "익명 SOL 고래 3",      address: "DxoRJ4f5XRMvXU9SGuM9bwFQoaPjMivNFKFoY8FNAhvF", tag: "대형 투자자", chain: "SOL", isLocked: true },

  // ── BNB (10개) ── ETH와 같은 주소 포맷, BNB 네트워크로 별도 조회 ────────
  { id: "bnb-binance-1",    name: "Binance BNB 재단",    address: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-binance-hot",  name: "Binance Hot",         address: "0x1fbe2acee135d991592f167ac371f3dd893a508b", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-okx",          name: "OKX BNB",             address: "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-bybit",        name: "Bybit BNB",           address: "0xf89d7b9c864f589bbF53a82105107622B35EaA40", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-kucoin",       name: "KuCoin BNB",          address: "0x2B5634C42055806a59e9107ED44D43c426E58258", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-gate",         name: "Gate.io BNB",         address: "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-huobi",        name: "HTX (Huobi) BNB",     address: "0xaB5C66752a9e8167967685F1450532fB96d5d24f", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-coinbase",     name: "Coinbase BNB",        address: "0x503828976D22510aad0201ac7EC88293211D23Da", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-mexc",         name: "MEXC BNB",            address: "0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB", tag: "거래소",      chain: "BNB", isLocked: true },
  { id: "bnb-kraken",       name: "Kraken BNB",          address: "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2", tag: "거래소",      chain: "BNB", isLocked: true },

  // ── XRP (14개) ────────────────────────────────────────────────────────────
  { id: "xrp-binance",      name: "Binance XRP",         address: "rEy8TFcrAPvhpKrwyrscNYyqBGUkE9hKaJ",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-bitstamp",     name: "Bitstamp XRP",        address: "rrpNnNLKrartuEqfJGpqyDwPj1BBN1wr7L",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-upbit",        name: "Upbit XRP",           address: "rwjRDBTBEna9DFPnCseKm6wDi8xFPVRNsq",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-kraken",       name: "Kraken XRP",          address: "rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-coinbase",     name: "Coinbase XRP",        address: "rPz2qA514PjyMJvSEzeespgqnvBeB37FtB",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-gate",         name: "Gate.io XRP",         address: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-bithumb",      name: "Bithumb XRP",         address: "rBgnUKAEiFhCRLPoYNPPe3JUWayRjP6Ayg",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-bitfinex",     name: "Bitfinex XRP",        address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-kucoin",       name: "KuCoin XRP",          address: "rBPBRBGSMPHxHUBqJkBvJSHAapAVXZB2Fq",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-bybit",        name: "Bybit XRP",           address: "rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh",        tag: "거래소",      chain: "XRP", isLocked: true },
  { id: "xrp-mexc",         name: "MEXC XRP",            address: "rMQ98K56yXJbDGv49ZSmW51sLn94Xe1mu1",        tag: "거래소",      chain: "XRP", isLocked: true },

  // ── TRX (10개) ────────────────────────────────────────────────────────────
  { id: "trx-binance",      name: "Binance TRX",         address: "TJDENsfBJs4RFETt1X1W8wMDc8M5XnJhCe",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-huobi",        name: "HTX (Huobi) TRX",     address: "TVj7RNVHy6thbM7BWdSe9G6gXwKhjhdNZS",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-okx",          name: "OKX TRX",             address: "TGj1Ej1Q9jA6j5HkvJrSBfBkTFefhFKaJU",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-gate",         name: "Gate.io TRX",         address: "TDBg5mfKqaWwUnq5T6EBwEbcD6dMbmDFNf",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-kucoin",       name: "KuCoin TRX",          address: "TDM8PkNz65KbBHGb6r5ZJYbKnVDaKidpKW",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-bybit",        name: "Bybit TRX",           address: "TQrY8tryqsYVCZS3Y7kLN4v3T4FNK6Wh88",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-upbit",        name: "Upbit TRX",           address: "TDrwQkqM6bJVfBJ6PRCDS9eKhKvwCQdyVH",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-bithumb",      name: "Bithumb TRX",         address: "TGCRkw1V9jH5S35GDwEMNMKNMuVfBNDGSM",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-mexc",         name: "MEXC TRX",            address: "TEHtLnPBSKFaaBwNkxnNBYbETkbL2UiGGo",        tag: "거래소",      chain: "TRX", isLocked: true },
  { id: "trx-kraken",       name: "Kraken TRX",          address: "TS6LRWE4RL5DyB7ZYCuFNM8HKkBpFvS47W",        tag: "거래소",      chain: "TRX", isLocked: true },
];

export async function handleGetWhales(
  _request: Request,
  _env: Env,
): Promise<Response> {
  return Response.json(DEFAULT_WHALES);
}

export async function getWhaleList(env: Env): Promise<WhaleEntry[]> {
  const cached = await env.CACHE.get<WhaleEntry[]>(KV_KEY, "json");
  return cached ?? DEFAULT_WHALES;
}
