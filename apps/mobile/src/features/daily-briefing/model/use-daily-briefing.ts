import { computeDailySummary } from '@entities/daily-summary';
import type { WhaleTx } from '@entities/whale-tx';
import { formatEth } from '@shared/lib/format';
import { storage } from '@shared/lib/storage';
import { BRIEFING_KEY } from '@shared/lib/storage/keys';
import { toast } from '@shared/lib/toast';
import { useEffect } from 'react';

function todayString(): string {
  return new Date().toISOString().split('T')[0]!;
}

export function useDailyBriefing(movements: WhaleTx[] | undefined): void {
  useEffect(() => {
    if (!movements) {
      return;
    }

    const hour = new Date().getHours();
    if (hour < 9) {
      return;
    }

    const today = todayString();
    if (storage.getString(BRIEFING_KEY) === today) {
      return;
    }

    const summary = computeDailySummary(movements);
    const message =
      summary.totalCount > 0
        ? `오늘 고래 ${summary.totalCount}건 감지 · ${formatEth(summary.totalEth)} 이동`
        : '오늘 아직 대규모 이동 없음';

    toast.info(`🐋 ${message}`);
    storage.set(BRIEFING_KEY, today);
  }, [movements]);
}
