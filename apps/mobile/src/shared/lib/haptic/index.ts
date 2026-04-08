import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false } as const;

export const haptic = {
  impact: () => ReactNativeHapticFeedback.trigger('impactMedium', OPTIONS),
  light: () => ReactNativeHapticFeedback.trigger('impactLight', OPTIONS),
  success: () => ReactNativeHapticFeedback.trigger('notificationSuccess', OPTIONS),
};
