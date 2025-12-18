import { useDepositMutation } from "@/src/entities/deposit/model";


export const useDeposit = () => {
  const { deposit, isPending, isSuccess, error } = useDepositMutation();

  const handleDeposit = (amount: string, duration: number) => {

    if (parseFloat(amount) <= 0) return;

    deposit(amount, duration, {
        onSuccess: (hash: any) => {
            console.log("성공 토스트: 락업 완료!", hash);
        },
        onError: (e: any) => {
            console.log("실패 토스트: 가스비 부족 등 작업필요", e);
        }
    });
  };

  return {
    handleDeposit,
    isPending,
    isSuccess,
    error
  };
};