export type WhaleTxType = 'send' | 'receive' | 'swap';

export interface WhaleTx {
  txHash: string;
  type: WhaleTxType;
  amountEth: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: bigint;
  isLarge: boolean;
  asset: string;
}
