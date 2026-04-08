export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) {
    const v = value / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const v = value / 1_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatEth(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ETH`;
}

export function formatRelativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) {
    return '방금 전';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}분 전`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간 전`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return '어제';
  }
  if (days < 7) {
    return `${days}일 전`;
  }
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1주 전' : `${weeks}주 전`;
}
