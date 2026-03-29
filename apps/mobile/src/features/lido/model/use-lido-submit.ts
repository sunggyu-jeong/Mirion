import { useTxStore } from '@entities/tx';
import { useWalletStore } from '@entities/wallet';
import MetaMaskSDK from '@metamask/sdk';
import { LIDO_REFERRAL_ADDRESS, lidoContract } from '@shared/api/contracts';
import { useRef } from 'react';
import { encodeFunctionData } from 'viem';

let _sdk: InstanceType<typeof MetaMaskSDK> | null = null;
function getSDK() {
  if (!_sdk) {
    _sdk = new MetaMaskSDK({ dappMetadata: { name: 'LockFi', url: 'https://lockfi.app' } });
  }
  return _sdk;
}

export function useLidoSubmit() {
  const { setPending, setError, reset } = useTxStore();
  const address = useWalletStore(s => s.address);
  const isPendingRef = useRef(false);

  const submit = async (amountWei: bigint) => {
    if (isPendingRef.current) {
      return;
    }
    isPendingRef.current = true;
    try {
      const ethereum = getSDK().getProvider();
      if (!ethereum) {
        throw new Error('지갑 공급자를 초기화할 수 없습니다');
      }

      const data = encodeFunctionData({
        abi: lidoContract.abi,
        functionName: 'submit',
        args: [LIDO_REFERRAL_ADDRESS],
      });

      const txHash = (await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: address,
            to: lidoContract.address,
            value: `0x${amountWei.toString(16)}`,
            data,
          },
        ],
      })) as string;

      setPending(txHash, 'stake');
      return txHash;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      isPendingRef.current = false;
    }
  };

  return { submit, isPending: isPendingRef.current, reset };
}
