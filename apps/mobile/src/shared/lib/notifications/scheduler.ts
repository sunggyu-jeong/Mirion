
import { requestNotificationPermissions } from '@/src/shared/lib';
import * as Notifications from 'expo-notifications';

interface ScheduleOptions {
  title: string;
  body: string;
  seconds: number;
} 

export const scheduleLocalNotification = async ({ title, body, seconds}: ScheduleOptions) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound:true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    }
  })

  return true;
}