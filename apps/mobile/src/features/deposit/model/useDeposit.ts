import { useDepositMutation, useDepositNotification } from "@/src/entities/deposit";
import { getDiffInDays } from "@/src/shared";
import { useWalletInfo } from "@reown/appkit-react-native";
import { addDays } from "date-fns";
import { useState, useMemo } from "react";
import { Alert } from "react-native";


export const useDeposit = () => {
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 7));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const { formattedBalance } = useWalletInfo();
  const { deposit, isPending } = useDepositMutation();
  const { scheduleMaturityAlarm } = useDepositNotification();

  const daysDuration = useMemo(() => {
    return getDiffInDays(new Date(), selectedDate);
  }, [selectedDate]);

  // MAX 버튼 로직
  const handleMax = () => {
    if (formattedBalance) {
      const valueOnly = formattedBalance.split(' ')[0];
      setAmount(valueOnly);
    }
  };

  // 제출 로직
  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('알림', '예치할 금액을 입력해주세요.');
      return;
    }
    
    if (daysDuration < 7) {
      Alert.alert('알림', '최소 7일 이상 잠궈야 합니다.');
      return;
    }

    const unlockTimestamp = Math.floor(selectedDate.getTime() / 1000);

    deposit(amount, unlockTimestamp, {
      onSuccess: () => {
        Alert.alert('성공', '예치가 완료되었습니다!');
        scheduleMaturityAlarm(daysDuration * 24 * 60 * 60);
        setAmount('');
      },
      onError: (e: any) => {
        Alert.alert('오류', e.message);
      }
    });
  };

  return {
    formState: { 
      amount, 
      selectedDate, 
      isDatePickerVisible, 
      daysDuration 
    },
    actions: { 
      setAmount, 
      setSelectedDate, 
      setDatePickerVisibility, 
      handleMax, 
      handleSubmit 
    },
    status: { 
      isPending 
    },
  };
};