import { timeLockContract } from '@/src/shared/config/contracts';
import { parseEther } from 'viem';
import { useWriteContract } from 'wagmi';

export const useDepositMutation = () => {
    const { mutate, ...rest } = useWriteContract(); 

    const deposit = (amount: string, unlockTime: number, options?: any) => {
        return mutate({
            ...timeLockContract,
            functionName: 'deposit',
            args: [BigInt(unlockTime)],
            value: parseEther(amount),
        }, options);
    };

    return { deposit, ...rest };
}