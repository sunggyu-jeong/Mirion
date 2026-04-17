import type { CexTrade } from '@entities/cex-trade';
import type { ActivityEvent } from '@entities/unified-activity';
import type { WhaleProfile } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import type { EthMarketData } from '@shared/api/coingecko';

const NOW = Date.now();

export const MOCK_WHALES: WhaleProfile[] = [
  {
    id: '1',
    name: 'Whale Alpha',
    address: '0xabc123',
    tag: 'Smart Money',
    chain: 'ETH',
    isLocked: false,
    nativeBalance: 12500n,
    totalValueUsd: 28_500_000,
    activityType: 'buy',
  },
  {
    id: '2',
    name: 'Whale Beta',
    address: '0xdef456',
    tag: 'Exchange Wallet',
    chain: 'BTC',
    isLocked: false,
    nativeBalance: 420n,
    totalValueUsd: 18_200_000,
    activityType: 'sell',
  },
  {
    id: '3',
    name: 'Whale Gamma',
    address: '0xghi789',
    tag: 'VC Fund',
    chain: 'SOL',
    isLocked: false,
    nativeBalance: 85000n,
    totalValueUsd: 12_400_000,
    activityType: 'transfer',
  },
  {
    id: '4',
    name: 'Locked Whale',
    address: '0xlocked',
    tag: 'Unknown',
    chain: 'ETH',
    isLocked: true,
    nativeBalance: 0n,
    totalValueUsd: 0,
    activityType: 'transfer',
  },
];

export const MOCK_WHALE_TXS: WhaleTx[] = [
  {
    txHash: '0xaaa',
    type: 'receive',
    amountNative: 2500,
    amountUsd: 6_500_000,
    fromAddress: '0xfrom1',
    toAddress: '0xto1',
    timestampMs: NOW - 300_000,
    blockNumber: 19_000_001n,
    isLarge: true,
    asset: 'ETH',
    chain: 'ETH',
  },
  {
    txHash: '0xbbb',
    type: 'send',
    amountNative: 15,
    amountUsd: 980_000,
    fromAddress: '0xfrom2',
    toAddress: '0xto2',
    timestampMs: NOW - 600_000,
    blockNumber: 19_000_000n,
    isLarge: true,
    asset: 'BTC',
    chain: 'BTC',
  },
  {
    txHash: '0xccc',
    type: 'swap',
    amountNative: 50000,
    amountUsd: 2_100_000,
    fromAddress: '0xfrom3',
    toAddress: '0xto3',
    timestampMs: NOW - 900_000,
    blockNumber: 18_999_999n,
    isLarge: true,
    asset: 'SOL',
    chain: 'SOL',
  },
  {
    txHash: '0xddd',
    type: 'receive',
    amountNative: 800,
    amountUsd: 1_200_000,
    fromAddress: '0xfrom4',
    toAddress: '0xto4',
    timestampMs: NOW - 1_200_000,
    blockNumber: 18_999_998n,
    isLarge: false,
    asset: 'ETH',
    chain: 'ETH',
  },
];

export const MOCK_CEX_TRADES: CexTrade[] = [
  {
    symbol: 'ETHUSDT',
    side: 'buy',
    price: 2640,
    amount: 1200,
    valueUsd: 3_168_000,
    timestampMs: NOW - 120_000,
  },
  {
    symbol: 'BTCUSDT',
    side: 'sell',
    price: 65000,
    amount: 12,
    valueUsd: 780_000,
    timestampMs: NOW - 240_000,
  },
  {
    symbol: 'SOLUSDT',
    side: 'buy',
    price: 42,
    amount: 80000,
    valueUsd: 3_360_000,
    timestampMs: NOW - 480_000,
  },
];

export const MOCK_ACTIVITY_EVENTS: ActivityEvent[] = [
  ...MOCK_WHALE_TXS.map<ActivityEvent>(tx => ({
    source: 'onchain',
    id: tx.txHash,
    timestampMs: tx.timestampMs,
    data: tx,
  })),
  ...MOCK_CEX_TRADES.map<ActivityEvent>((t, i) => ({
    source: 'cex',
    id: `cex-${i}`,
    timestampMs: t.timestampMs,
    data: t,
  })),
];

export const MOCK_ETH_MARKET_DATA: EthMarketData = {
  priceUsd: 2640.52,
  change24h: 3.14,
  marketCapUsd: 317_800_000_000,
  volume24hUsd: 12_400_000_000,
};

export function mockPriceChart(points = 48): { timestampMs: number; price: number }[] {
  const base = 2500;
  return Array.from({ length: points }, (_, i) => ({
    timestampMs: NOW - (points - i) * 1_800_000,
    price: base + Math.sin(i / 5) * 120 + Math.random() * 40,
  }));
}
