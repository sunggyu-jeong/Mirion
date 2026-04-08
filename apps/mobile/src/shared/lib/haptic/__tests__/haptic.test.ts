jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: { trigger: jest.fn() },
}));

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { haptic } from '../index';

const mockTrigger = ReactNativeHapticFeedback.trigger as jest.Mock;

describe('haptic', () => {
  beforeEach(() => mockTrigger.mockClear());

  it('impact triggers impactMedium', () => {
    haptic.impact();
    expect(mockTrigger).toHaveBeenCalledWith(
      'impactMedium',
      expect.objectContaining({ enableVibrateFallback: true }),
    );
  });

  it('light triggers impactLight', () => {
    haptic.light();
    expect(mockTrigger).toHaveBeenCalledWith('impactLight', expect.any(Object));
  });

  it('success triggers notificationSuccess', () => {
    haptic.success();
    expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
  });
});
