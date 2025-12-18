import { timeLockContract } from '@/src/shared/config/contracts';
import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const useWithDraw = () => {
    const { data: hash, mutate, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const withdraw = (amount: string, unlockTime: number | bigint) => {
        mutate({
            ...timeLockContract,
            functionName: 'withdraw',
            args: []
        })
    }
        

    return {
        hash,
        mutate,
        isPending,
        isConfirming,
        isConfirmed,
        error
    }
}