import type { WhaleTx } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

export interface TokenHolding {
  symbol: string;
  amount: string;
  valueUsd: string;
  percentage: number;
  color: string;
}

export interface WhaleDetailData {
  totalValueUsd: string;
  tokens: TokenHolding[];
  transactions: WhaleTx[];
}

const DETAIL_BY_ID: Record<string, WhaleDetailData> = {
  vitalik: {
    totalValueUsd: '$847M',
    tokens: [
      { symbol: 'ETH', amount: '345,678', valueUsd: '$847M', percentage: 94.2, color: '#627EEA' },
      { symbol: 'USDC', amount: '2,800,000', valueUsd: '$2.8M', percentage: 3.1, color: '#2775CA' },
      { symbol: 'UNI', amount: '1,200,000', valueUsd: '$2.4M', percentage: 2.7, color: '#FF007A' },
    ],
    transactions: [
      {
        txHash: '0xa1b2c3d4e5f60001',
        type: 'transfer',
        amountEth: '100 ETH',
        amountUsd: '$245K',
        fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        toAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
        timestamp: '3시간 전',
        isLarge: false,
      },
      {
        txHash: '0xa1b2c3d4e5f60002',
        type: 'send',
        amountEth: '500 ETH',
        amountUsd: '$1.2M',
        fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        toAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        timestamp: '1일 전',
        isLarge: true,
      },
      {
        txHash: '0xa1b2c3d4e5f60003',
        type: 'receive',
        amountEth: '200 ETH',
        amountUsd: '$490K',
        fromAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        toAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        timestamp: '3일 전',
        isLarge: false,
      },
      {
        txHash: '0xa1b2c3d4e5f60004',
        type: 'send',
        amountEth: '1,000 ETH',
        amountUsd: '$2.45M',
        fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        toAddress: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
        timestamp: '5일 전',
        isLarge: true,
      },
      {
        txHash: '0xa1b2c3d4e5f60005',
        type: 'receive',
        amountEth: '3,200 ETH',
        amountUsd: '$7.84M',
        fromAddress: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
        toAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        timestamp: '1주 전',
        isLarge: true,
      },
    ],
  },
  'jump-crypto': {
    totalValueUsd: '$2.1B',
    tokens: [
      { symbol: 'ETH', amount: '432,100', valueUsd: '$1.06B', percentage: 50.5, color: '#627EEA' },
      { symbol: 'WBTC', amount: '8,920', valueUsd: '$548M', percentage: 26.1, color: '#F7931A' },
      {
        symbol: 'USDC',
        amount: '380,000,000',
        valueUsd: '$380M',
        percentage: 18.1,
        color: '#2775CA',
      },
      { symbol: 'stETH', amount: '22,000', valueUsd: '$53.9M', percentage: 2.6, color: '#00A3FF' },
      { symbol: 'UNI', amount: '12,000,000', valueUsd: '$24M', percentage: 1.1, color: '#FF007A' },
    ],
    transactions: [
      {
        txHash: '0xb2c3d4e5f6a10001',
        type: 'receive',
        amountEth: '8,500 ETH',
        amountUsd: '$20.8M',
        fromAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
        toAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
        timestamp: '47분 전',
        isLarge: true,
      },
      {
        txHash: '0xb2c3d4e5f6a10002',
        type: 'swap',
        amountEth: '3,000 ETH → 7,350,000 USDC',
        amountUsd: '$7.35M',
        fromAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
        toAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        timestamp: '2시간 전',
        isLarge: true,
      },
      {
        txHash: '0xb2c3d4e5f6a10003',
        type: 'send',
        amountEth: '5,200 ETH',
        amountUsd: '$12.7M',
        fromAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
        toAddress: '0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43',
        timestamp: '6시간 전',
        isLarge: true,
      },
      {
        txHash: '0xb2c3d4e5f6a10004',
        type: 'receive',
        amountEth: '12,000 ETH',
        amountUsd: '$29.4M',
        fromAddress: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
        toAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
        timestamp: '1일 전',
        isLarge: true,
      },
      {
        txHash: '0xb2c3d4e5f6a10005',
        type: 'swap',
        amountEth: '10,000 ETH → WBTC',
        amountUsd: '$24.5M',
        fromAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
        toAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        timestamp: '2일 전',
        isLarge: true,
      },
    ],
  },
  'anon-7': {
    totalValueUsd: '$480M',
    tokens: [
      { symbol: 'ETH', amount: '98,200', valueUsd: '$240M', percentage: 50.0, color: '#627EEA' },
      { symbol: 'stETH', amount: '65,000', valueUsd: '$159M', percentage: 33.1, color: '#00A3FF' },
      {
        symbol: 'USDC',
        amount: '62,000,000',
        valueUsd: '$62M',
        percentage: 12.9,
        color: '#2775CA',
      },
      { symbol: 'AAVE', amount: '180,000', valueUsd: '$19M', percentage: 4.0, color: '#B6509E' },
    ],
    transactions: [
      {
        txHash: '0xc3d4e5f6a1b20001',
        type: 'send',
        amountEth: '2,100 ETH',
        amountUsd: '$5.1M',
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        toAddress: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
        timestamp: '2시간 전',
        isLarge: true,
      },
      {
        txHash: '0xc3d4e5f6a1b20002',
        type: 'swap',
        amountEth: '1,500 ETH → stETH',
        amountUsd: '$3.7M',
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        toAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        timestamp: '5시간 전',
        isLarge: true,
      },
      {
        txHash: '0xc3d4e5f6a1b20003',
        type: 'receive',
        amountEth: '4,800 ETH',
        amountUsd: '$11.8M',
        fromAddress: '0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        timestamp: '1일 전',
        isLarge: true,
      },
      {
        txHash: '0xc3d4e5f6a1b20004',
        type: 'send',
        amountEth: '800 ETH',
        amountUsd: '$1.96M',
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        toAddress: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
        timestamp: '3일 전',
        isLarge: true,
      },
      {
        txHash: '0xc3d4e5f6a1b20005',
        type: 'receive',
        amountEth: '6,500 ETH',
        amountUsd: '$15.9M',
        fromAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        timestamp: '5일 전',
        isLarge: true,
      },
    ],
  },
};

const FALLBACK_DETAIL: WhaleDetailData = {
  totalValueUsd: '???',
  tokens: [
    { symbol: 'ETH', amount: '???', valueUsd: '???', percentage: 60, color: '#627EEA' },
    { symbol: 'USDC', amount: '???', valueUsd: '???', percentage: 25, color: '#2775CA' },
    { symbol: 'WBTC', amount: '???', valueUsd: '???', percentage: 15, color: '#F7931A' },
  ],
  transactions: [],
};

export function useWhaleDetail(whaleId: string) {
  return useQuery<WhaleDetailData>({
    queryKey: ['whale-detail', whaleId],
    queryFn: async () => DETAIL_BY_ID[whaleId] ?? FALLBACK_DETAIL,
    staleTime: 30_000,
  });
}
