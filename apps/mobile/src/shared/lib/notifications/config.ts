import notifee from '@notifee/react-native';

export const configureNotificationHandler = () => {
  notifee.onForegroundEvent(() => {});
};
