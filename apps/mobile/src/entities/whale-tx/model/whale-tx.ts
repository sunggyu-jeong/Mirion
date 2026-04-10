export type WhaleTxType = 'send' | 'receive' | 'swap';

export interface WhaleTx {
  txHash: string;
  type: WhaleTxType;
  amountNative: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: bigint;
  isLarge: boolean;
  asset: string;
}
