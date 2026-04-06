import type { WhaleTx } from '@entities/whale-tx';
import { useQuery } from '@tanstack/react-query';

const ALL_MOVEMENTS: WhaleTx[] = [
  {
    txHash: '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    type: 'send',
    amountEth: '32,000 ETH',
    amountUsd: '$78.4M',
    fromAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    toAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
    timestamp: '5분 전',
    isLarge: true,
  },
  {
    txHash: '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    type: 'receive',
    amountEth: '8,500 ETH',
    amountUsd: '$20.8M',
    fromAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    toAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
    timestamp: '47분 전',
    isLarge: true,
  },
  {
    txHash: '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    type: 'swap',
    amountEth: '3,000 ETH → USDC',
    amountUsd: '$7.35M',
    fromAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
    toAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    timestamp: '2시간 전',
    isLarge: true,
  },
  {
    txHash: '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    type: 'send',
    amountEth: '2,100 ETH',
    amountUsd: '$5.1M',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    toAddress: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
    timestamp: '2시간 전',
    isLarge: true,
  },
  {
    txHash: '0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    type: 'receive',
    amountEth: '12,000 ETH',
    amountUsd: '$29.4M',
    fromAddress: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    toAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
    timestamp: '5시간 전',
    isLarge: true,
  },
  {
    txHash: '0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    type: 'swap',
    amountEth: '10,000 ETH → WBTC',
    amountUsd: '$24.5M',
    fromAddress: '0x4C6f947Ae67F572afa4ae0730947DE7C874F95Ef',
    toAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    timestamp: '6시간 전',
    isLarge: true,
  },
  {
    txHash: '0xa2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3',
    type: 'send',
    amountEth: '5,600 ETH',
    amountUsd: '$13.7M',
    fromAddress: '0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43',
    toAddress: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
    timestamp: '8시간 전',
    isLarge: true,
  },
  {
    txHash: '0xb3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4',
    type: 'receive',
    amountEth: '18,400 ETH',
    amountUsd: '$45.1M',
    fromAddress: '0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489',
    toAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    timestamp: '어제',
    isLarge: true,
  },
];

export function useWhaleMovements() {
  return useQuery<WhaleTx[]>({
    queryKey: ['whale-movements-global'],
    queryFn: async () => ALL_MOVEMENTS,
    staleTime: 15_000,
  });
}
