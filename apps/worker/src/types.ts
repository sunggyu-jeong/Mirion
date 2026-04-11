export interface Env {
  CACHE: KVNamespace;
  ALCHEMY_API_KEY: string;
  ALCHEMY_NETWORK: string;
  COINGECKO_API_KEY?: string;
  HELIUS_API_KEY?: string;
  TRONGRID_API_KEY?: string;
  MORALIS_API_KEY?: string;
  CEX_INGEST_SECRET?: string;
}

export interface CexTradeDTO {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  valueUsd: number;
  timestampMs: number;
}

// WhaleTx with blockNumber as string (bigint cannot be JSON serialized)
export interface WhaleTxDTO {
  txHash: string;
  type: "send" | "receive" | "swap";
  amountNative: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: string;
  isLarge: boolean;
  asset: string;
  chain: string;
}

export interface WhaleProfileDTO {
  nativeBalance: string;
  totalValueUsd: number;
  tokens: { contractAddress: string; rawBalance: string }[];
}

export interface EthMarketDTO {
  priceUsd: number;
  change24h: number;
  marketCapUsd: number;
  volume24hUsd: number;
}

export interface PricePointDTO {
  timestampMs: number;
  price: number;
}

// Alchemy raw types
export interface AlchemyJsonRpcResponse<T> {
  id: number;
  jsonrpc: "2.0";
  result?: T;
  error?: { code: number; message: string };
}

export interface AlchemyTransferRaw {
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  blockNum: string;
  metadata: { blockTimestamp: string };
}

export interface AlchemyAssetTransfersResponse {
  transfers: AlchemyTransferRaw[];
  pageKey?: string;
}

export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export interface AlchemyTokenBalancesResponse {
  address: string;
  tokenBalances: AlchemyTokenBalance[];
}
