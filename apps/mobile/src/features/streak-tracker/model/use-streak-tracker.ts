import type { StreakData } from '@entities/streak';
import { computeStreak, getTodayString } from '@entities/streak';
import { storage } from '@shared/lib/storage';
import { STREAK_KEY } from '@shared/lib/storage/keys';
import { useEffect, useState } from 'react';

function readStreak(): StreakData | null {
  const raw = storage.getString(STREAK_KEY);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as StreakData;
}

function writeStreak(data: StreakData): void {
  storage.set(STREAK_KEY, JSON.stringify(data));
}

export function useStreakTracker(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const today = getTodayString();
    const current = readStreak();
    const next = computeStreak(current, today);
    if (next !== current) {
      writeStreak(next);
    }
    setCount(next.count);
  }, []);

  return count;
}
