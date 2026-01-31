import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { timeLockContract } from '@/src/shared';

export const useVaultActions = () => {
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = () => writeContract({ ...timeLockContract, functionName: 'withdraw' });

  return {
    withdraw,
    isLoading: isWritePending || isConfirming,
    isSuccess,
  };
};
