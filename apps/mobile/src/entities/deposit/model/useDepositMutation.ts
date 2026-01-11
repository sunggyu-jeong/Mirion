import { timeLockContract } from '@/src/shared/config/contracts';
import { parseEther } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export const useDepositMutation = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = (amount: string, unlockTime: number) => {
    writeContract({
      ...timeLockContract,
      functionName: 'deposit',
      args: [BigInt(unlockTime)],
      value: parseEther(amount),
    });
  };

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
