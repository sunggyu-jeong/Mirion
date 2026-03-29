import { useTxStore } from '@entities/tx';
import { useWalletStore } from '@entities/wallet';
import MetaMaskSDK from '@metamask/sdk';
import { useRef } from 'react';
import { encodeFunctionData } from 'viem';

const LIDO_WITHDRAWAL_ADDRESS = '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1' as const;

const withdrawalAbi = [
  {
    inputs: [
      { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
      { internalType: 'address', name: '_owner', type: 'address' },
    ],
    name: 'requestWithdrawals',
    outputs: [{ internalType: 'uint256[]', name: 'requestIds', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

let _sdk: InstanceType<typeof MetaMaskSDK> | null = null;
function getSDK() {
  if (!_sdk) {
    _sdk = new MetaMaskSDK({ dappMetadata: { name: 'LockFi', url: 'https://lockfi.app' } });
  }
  return _sdk;
}

export function useLidoWithdraw() {
  const { setPending, setError, reset } = useTxStore();
  const address = useWalletStore(s => s.address);
  const isPendingRef = useRef(false);

  const requestWithdrawal = async (amountWei: bigint) => {
    if (isPendingRef.current || !address) {
      return;
    }
    isPendingRef.current = true;
    try {
      const ethereum = getSDK().getProvider();
      if (!ethereum) {
        throw new Error('지갑 공급자를 초기화할 수 없습니다');
      }

      const data = encodeFunctionData({
        abi: withdrawalAbi,
        functionName: 'requestWithdrawals',
        args: [[amountWei], address as `0x${string}`],
      });

      const txHash = (await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, to: LIDO_WITHDRAWAL_ADDRESS, data }],
      })) as string;

      setPending(txHash, 'unstake');
      return txHash;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      isPendingRef.current = false;
    }
  };

  return { requestWithdrawal, isPending: isPendingRef.current, reset };
}
