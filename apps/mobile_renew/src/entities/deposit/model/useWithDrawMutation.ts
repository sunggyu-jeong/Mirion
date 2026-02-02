import { timeLockContract } from '@/shared';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export const useWithDrawMutation = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = () => {
    writeContract({
      ...timeLockContract,
      functionName: 'withdraw',
      args: [],
    });
  };

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
