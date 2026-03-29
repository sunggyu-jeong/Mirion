import { useTxStore } from '@entities/tx';
import { publicClient } from '@shared/lib/web3/client';
import { useEffect } from 'react';

export function useTxTracker() {
  const txHash = useTxStore(s => s.txHash);
  const status = useTxStore(s => s.status);
  const { setSuccess, setError } = useTxStore();

  useEffect(() => {
    if (!txHash || status !== 'pending') {
      return;
    }
    let cancelled = false;

    publicClient
      .waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        timeout: 120_000,
      })
      .then(receipt => {
        if (cancelled) {
          return;
        }
        if (receipt.status === 'success') {
          setSuccess();
        } else {
          setError('트랜잭션이 실패했습니다');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('트랜잭션 확인 중 오류가 발생했습니다');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [txHash, status, setSuccess, setError]);
}
