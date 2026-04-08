export type StreakData = { count: number; lastDate: string };

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export function getTodayString(): string {
  return toDateString(new Date());
}

export function computeStreak(data: StreakData | null, today: string): StreakData {
  if (!data) {
    return { count: 1, lastDate: today };
  }
  if (data.lastDate === today) {
    return data;
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (data.lastDate === toDateString(yesterday)) {
    return { count: data.count + 1, lastDate: today };
  }
  return { count: 1, lastDate: today };
}
