import { useLidoStore } from '@entities/lido';
import { useCallback, useMemo, useState } from 'react';

const DURATION_OPTIONS = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
  { label: '1년', months: 12 },
  { label: '2년', months: 24 },
  { label: '5년', months: 60 },
] as const;

const QUICK_AMOUNTS = ['0.1', '0.5', '1', '5', '10'] as const;

const TICK_MAP: Record<number, number[]> = {
  1: [0, 1],
  3: [0, 1, 2, 3],
  6: [0, 2, 4, 6],
  12: [0, 3, 6, 9, 12],
  24: [0, 6, 12, 18, 24],
  60: [0, 12, 24, 36, 48, 60],
};

function calcGrowth(principal: number, apyPercent: number, months: number): number[] {
  const monthlyRate = apyPercent / 100 / 12;
  return Array.from({ length: months + 1 }, (_, i) => principal * Math.pow(1 + monthlyRate, i));
}

function formatMonth(m: number): string {
  if (m === 0) {
    return '지금';
  }
  if (m % 12 === 0) {
    return `${m / 12}년`;
  }
  return `${m}개월`;
}

export type SimulatorResult = {
  growthData: number[];
  earned: number;
  finalBalance: number;
  xTicks: Array<{ index: number; label: string }>;
};

export function useSimulator() {
  const { estimatedApy } = useLidoStore();

  const [amountText, setAmountText] = useState('1');
  const [selectedMonths, setSelectedMonths] = useState(12);

  const apy = estimatedApy > 0 ? estimatedApy : 3.5;
  const principal = parseFloat(amountText) || 0;

  const result = useMemo<SimulatorResult | null>(() => {
    if (principal <= 0) {
      return null;
    }

    const growthData = calcGrowth(principal, apy, selectedMonths);
    const finalBalance = growthData[growthData.length - 1] ?? principal;
    const earned = finalBalance - principal;
    const tickMonths = TICK_MAP[selectedMonths] ?? [0, selectedMonths];
    const xTicks = tickMonths.map(m => ({ index: m, label: formatMonth(m) }));

    return { growthData, earned, finalBalance, xTicks };
  }, [principal, apy, selectedMonths]);

  const selectAmount = useCallback((v: string) => setAmountText(v), []);
  const selectMonths = useCallback((m: number) => setSelectedMonths(m), []);

  return {
    apy,
    amountText,
    setAmountText,
    selectedMonths,
    selectAmount,
    selectMonths,
    result,
    durationOptions: DURATION_OPTIONS,
    quickAmounts: QUICK_AMOUNTS,
  };
}
