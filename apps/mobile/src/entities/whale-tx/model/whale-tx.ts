export type WhaleTxType = 'send' | 'receive' | 'swap';

export interface WhaleTx {
  txHash: string;
  type: WhaleTxType;
  amountEth: string;
  amountUsd: string;
  fromAddress: string;
  toAddress: string;
  timestamp: string;
  isLarge: boolean;
}
