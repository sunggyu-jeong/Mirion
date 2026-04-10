export interface Env {
  CACHE: KVNamespace;
  ALCHEMY_API_KEY: string;
  ALCHEMY_NETWORK: string;
}

// WhaleTx with blockNumber as string (bigint cannot be JSON serialized)
export interface WhaleTxDTO {
  txHash: string;
  type: "send" | "receive" | "swap";
  amountEth: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: string;
  isLarge: boolean;
  asset: string;
}

export interface WhaleProfileDTO {
  ethBalance: string; // hex string e.g. "0xDE0B6B3A7640000"
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
