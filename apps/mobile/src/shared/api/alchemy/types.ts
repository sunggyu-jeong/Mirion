export interface AlchemyJsonRpcResponse<T> {
  id: number;
  jsonrpc: '2.0';
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
  metadata: {
    blockTimestamp: string;
  };
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
