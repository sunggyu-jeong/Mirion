export type TxType = 'deposit' | 'withdraw' | 'claimInterest';

export type TxStatus = 'pending' | 'success' | 'failed' | 'dropped';

export type TxRecord = {
  txHash: `0x${string}`;
  type: TxType;
  timestamp: number;
  status: TxStatus;
};
