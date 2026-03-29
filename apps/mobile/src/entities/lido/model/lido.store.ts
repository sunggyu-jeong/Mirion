import { create } from 'zustand';

interface LidoState {
  stakedBalance: bigint;
  estimatedApy: number;
  stakeBaseline: bigint;
  setStakedBalance: (balance: bigint) => void;
  setEstimatedApy: (apy: number) => void;
  setStakeBaseline: (baseline: bigint) => void;
  reset: () => void;
}

const initialState = {
  stakedBalance: 0n,
  estimatedApy: 0,
  stakeBaseline: 0n,
};

export const useLidoStore = create<LidoState>()(set => ({
  ...initialState,
  setStakedBalance: stakedBalance => set({ stakedBalance }),
  setEstimatedApy: estimatedApy => set({ estimatedApy }),
  setStakeBaseline: stakeBaseline => set({ stakeBaseline }),
  reset: () => set(initialState),
}));
