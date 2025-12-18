

import { timeLockContract } from '@/src/shared/config/contracts';
import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export const useDeposit = () => {
    const { mutate, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

    const deposit = (amount: string, unlockTime: number) => {
        mutate(
            {
                ...timeLockContract,
                functionName: 'deposit',
                args: [BigInt(unlockTime)],
                value: parseEther(amount),
            },
            {
                onSuccess: (txHash) => {
                    console.log("TODO: >>>>>>>>>>>>>> 성공 토스트 작업", txHash)
                },
                onError: (error) => {
                    console.log("TODO: >>>>>>>>>>>>>> 실패 토스트 작업", error)
                }
            }
        );
    }

    return {
        deposit,
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        error
    }
}
