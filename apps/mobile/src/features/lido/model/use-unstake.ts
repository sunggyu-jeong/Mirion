import { useLidoStore } from '@entities/lido';
import { useCallback, useState } from 'react';
import { formatEther, parseEther } from 'viem';

import { useLidoWithdraw } from './use-lido-withdraw';

type UnstakeState = {
  amount: string;
  error: string;
};

export function useUnstake() {
  const { stakedBalance } = useLidoStore();
  const { requestWithdrawal, isPending } = useLidoWithdraw();
  const [state, setState] = useState<UnstakeState>({ amount: '', error: '' });

  const setAmount = useCallback((amount: string) => {
    setState(prev => ({ ...prev, amount, error: '' }));
  }, []);

  const setMax = useCallback(() => {
    setState({ amount: parseFloat(formatEther(stakedBalance)).toFixed(6), error: '' });
  }, [stakedBalance]);

  const submit = useCallback(async (): Promise<boolean> => {
    const parsed = parseFloat(state.amount);
    if (!parsed || parsed <= 0) {
      setState(prev => ({ ...prev, error: '금액을 입력해주세요' }));
      return false;
    }
    const amountWei = parseEther(state.amount as `${number}`);
    if (amountWei > stakedBalance) {
      setState(prev => ({ ...prev, error: '스테이킹 잔고를 초과합니다' }));
      return false;
    }
    try {
      await requestWithdrawal(amountWei);
      setState({ amount: '', error: '' });
      return true;
    } catch {
      setState(prev => ({ ...prev, error: '출금 요청에 실패했습니다' }));
      return false;
    }
  }, [state.amount, stakedBalance, requestWithdrawal]);

  return { ...state, setAmount, setMax, submit, isPending };
}
