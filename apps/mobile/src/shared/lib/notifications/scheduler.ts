import notifee, { TriggerType } from '@notifee/react-native';

import { requestNotificationPermissions } from '@/src/shared/lib/notifications/permission';

interface ScheduleOptions {
  title: string;
  body: string;
  seconds: number;
}

export const scheduleLocalNotification = async ({ title, body, seconds }: ScheduleOptions) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return false;
  }

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: { channelId },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + seconds * 1000,
    },
  );

  return true;
};
