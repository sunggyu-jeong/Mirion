import notifee, { AuthorizationStatus } from '@notifee/react-native';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};
