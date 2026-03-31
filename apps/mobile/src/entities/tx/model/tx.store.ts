import { create } from 'zustand';

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';
export type TxType = 'stake' | 'unstake';

interface TxState {
  txHash: string | null;
  status: TxStatus;
  txType: TxType | null;
  amountEth: string | null;
  errorMessage: string | null;
  setPending: (txHash: string, txType: TxType, amountEth?: string) => void;
  setSuccess: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

const initialState = {
  txHash: null,
  status: 'idle' as TxStatus,
  txType: null,
  amountEth: null,
  errorMessage: null,
};

export const useTxStore = create<TxState>()(set => ({
  ...initialState,
  setPending: (txHash, txType, amountEth) =>
    set({ txHash, txType, amountEth: amountEth ?? null, status: 'pending', errorMessage: null }),
  setSuccess: () => set({ status: 'success' }),
  setError: message => set({ status: 'error', errorMessage: message }),
  reset: () => set(initialState),
}));
