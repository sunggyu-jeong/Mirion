export type MagnitudeLevel = 'small' | 'medium' | 'large' | 'massive' | 'legendary';

export interface MagnitudeInfo {
  level: MagnitudeLevel;
  label: string;
  color: string;
  bg: string;
}

const THRESHOLDS: Array<{ min: number; info: MagnitudeInfo }> = [
  {
    min: 50_000,
    info: { level: 'legendary', label: '역대급 ⚡', color: '#7c3aed', bg: '#f5f3ff' },
  },
  {
    min: 10_000,
    info: { level: 'massive', label: '초대형 🔴', color: '#dc2626', bg: '#fef2f2' },
  },
  {
    min: 1_000,
    info: { level: 'large', label: '대형', color: '#ea580c', bg: '#fff7ed' },
  },
  {
    min: 100,
    info: { level: 'medium', label: '중형', color: '#ca8a04', bg: '#fefce8' },
  },
  {
    min: 0,
    info: { level: 'small', label: '소형', color: '#64748b', bg: '#f8fafc' },
  },
];

export function getMagnitudeInfo(amountEth: number): MagnitudeInfo {
  for (const threshold of THRESHOLDS) {
    if (amountEth >= threshold.min) {
      return threshold.info;
    }
  }
  return THRESHOLDS[THRESHOLDS.length - 1].info;
}
