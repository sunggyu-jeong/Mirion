export interface HistoryItem {
  id: string;
  type: 'DEPOSIT' | "WITHDRAW",
  amount: string;
  unlockTime?: string;
  timestamp: number;
  txHash: string;
}

export interface HistoryState {
  items: HistoryItem[];
  isLoading: boolean;
  error: string | null;
}