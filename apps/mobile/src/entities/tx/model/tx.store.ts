import { create } from 'zustand';

export type TxType = 'transfer' | 'swap' | 'receive';
export type TxStatus = 'pending' | 'success' | 'error';

interface TxState {
  txHash: string | null;
  status: TxStatus;
  txType: TxType | null;
  amountEth: string | null;
  errorMessage: string | null;
  setTx: (tx: Partial<TxState>) => void;
  reset: () => void;
}

const initialState = {
  txHash: null,
  status: 'pending' as const,
  txType: null,
  amountEth: null,
  errorMessage: null,
};

export const useTxStore = create<TxState>()(set => ({
  ...initialState,
  setTx: tx => set(state => ({ ...state, ...tx })),
  reset: () => set(initialState),
}));
