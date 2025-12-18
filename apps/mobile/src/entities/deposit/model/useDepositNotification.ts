import { scheduleLocalNotification } from "@/src/shared/lib"

export const useDepositNotification = () => {
  const scheduleMaturityAlarm = async (duration: number)=> {
    const isSuccess = await scheduleLocalNotification({
      title: '락파이 만기 알림',
      body: '설정하신 락업 기간이 끝났습니다. 이제 출금 가능합니다!',
      seconds: duration
    });

    if (!isSuccess) {
      //fixme: - 알림권한필요 or 그냥 무시
      return false;
    }
    return true;
  }

  return { scheduleMaturityAlarm };
}