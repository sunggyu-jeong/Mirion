import { isMatured } from "@/shared";
import { differenceInDays, startOfDay } from "date-fns";
import { useMemo } from "react";

interface VaultProgressProps {
  startDate: string;
  unlockDate: string;
}

export const useVaultProgress = ({
  startDate,
  unlockDate,
}: VaultProgressProps) => {
  return useMemo(() => {
    const now = startOfDay(new Date());
    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(unlockDate));

    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    const remaining = differenceInDays(end, now);

    let percentage =
      totalDays > 0 ? Math.floor((elapsedDays / totalDays) * 100) : 0;

    percentage = Math.max(0, Math.min(100, percentage));
    return {
      progressPercentage: percentage,
      remainingDays: Math.max(0, remaining),
      isUnlocked: isMatured(unlockDate),
    };
  }, [startDate, unlockDate]);
};
