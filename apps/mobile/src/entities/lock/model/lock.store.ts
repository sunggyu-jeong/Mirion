import { create } from 'zustand';

type LockState = {
  balance: bigint;
  unlockTime: bigint;
  pendingReward: bigint;
  setLockInfo: (balance: bigint, unlockTime: bigint) => void;
  setPendingReward: (reward: bigint) => void;
  optimisticDeposit: (amount: bigint, unlockTime: bigint) => void;
  optimisticWithdraw: () => void;
  optimisticClaimInterest: () => void;
  reset: () => void;
};

const initialState = {
  balance: 0n,
  unlockTime: 0n,
  pendingReward: 0n,
};

export const useLockStore = create<LockState>()(set => ({
  ...initialState,
  setLockInfo: (balance, unlockTime) => set({ balance, unlockTime }),
  setPendingReward: pendingReward => set({ pendingReward }),
  optimisticDeposit: (amount, unlockTime) =>
    set(s => ({ balance: s.balance + amount, unlockTime })),
  optimisticWithdraw: () => set({ balance: 0n, unlockTime: 0n }),
  optimisticClaimInterest: () => set({ pendingReward: 0n }),
  reset: () => set(initialState),
}));
