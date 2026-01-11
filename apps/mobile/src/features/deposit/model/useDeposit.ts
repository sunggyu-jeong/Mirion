import { timeLockContract } from '@/src/shared/config/contracts';
import { parseEther } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export const useDeposit = () => {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeposit = (amount: string, duration: number) => {
    if (!amount || parseFloat(amount) <= 0) {
      console.log('에러 토스트: 금액을 입력해주세요.');
      return;
    }

    writeContract(
      {
        ...timeLockContract,
        functionName: 'deposit',
        args: [BigInt(duration)],
        value: parseEther(amount),
      },
      {
        onSuccess: txHash => {
          console.log('서명 완료! 네트워크 확인 중...', txHash);
        },
        onError: err => {
          console.log('실패 토스트: 유저 거부 또는 가스비 부족', err.message);
        },
      },
    );
  };

  return {
    handleDeposit,
    isPending: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
  };
};
