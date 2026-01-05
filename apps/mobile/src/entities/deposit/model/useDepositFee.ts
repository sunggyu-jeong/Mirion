import { timeLockContract } from '@/src/shared';
import { formatEther, parseEther } from 'viem';
import { useSimulateContract, useGasPrice } from 'wagmi';

interface UseDepositFeeProps {
  amount: string;
  unlockTime: number;
}

export const useDepositFee = ({ amount, unlockTime }: UseDepositFeeProps) => {
  const { data: gasPrice } = useGasPrice();
  const { 
    data: simulateData, 
    isLoading: isEstimating, 
    error 
  } = useSimulateContract({
    ...timeLockContract,
    functionName: 'deposit',
    args: [BigInt(unlockTime)],
    value: (amount && parseFloat(amount) > 0) ? parseEther(amount) : 0n,
    query: {
      enabled: !!amount && parseFloat(amount) > 0 && !!unlockTime && unlockTime > (Date.now() / 1000),
    }
  });

  const gasLimit = simulateData?.request.gas;
  const estimatedFee = (gasLimit && gasPrice) ? formatEther(gasLimit * gasPrice) : null;

  return {
    estimatedFee,
    isEstimating,
    gasLimit,
    error
  }
}