import { timeLockContract } from '@/src/shared/config/contracts';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export const useWithdrawMutation = () => {
  const { mutate, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const executeWithdraw = () => {
    mutate({
      ...timeLockContract,
      functionName: 'withdraw',
      args: [],
    });
  };

  return {
    executeWithdraw,
    hash,
    isPending,    
    isConfirming, 
    isConfirmed, 
    error,
  };
};