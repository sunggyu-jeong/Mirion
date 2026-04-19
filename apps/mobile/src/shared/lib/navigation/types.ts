export interface TxDetailParams {
  txHash: string;
  type: 'send' | 'receive' | 'swap';
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

export interface AppParamList {
  Splash: undefined;
  Legal: undefined;
  Onboarding: undefined;
  Main: { screen: 'Settings' } | undefined;
  WhaleDetail: { whaleId: string };
  TxDetail: TxDetailParams;
  RadarFeed: undefined;
  Error: { errorType: 'network' | 'transaction' | 'balance' };
}
