import notifee, { AuthorizationStatus, TriggerType } from '@notifee/react-native';
import { renderHook, act } from '@testing-library/react-native';

import { requestNotificationPermissions } from '@/src/shared/lib/notifications/permission';
import { scheduleLocalNotification } from '@/src/shared/lib/notifications/scheduler';
import { useDepositNotification } from '@/src/entities/deposit/model/useDepositNotification';

const mockNotifee = notifee as jest.Mocked<typeof notifee>;

describe('requestNotificationPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이미 권한이 승인된 경우 true를 반환해야 한다.', async () => {
    mockNotifee.requestPermission.mockResolvedValue({
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
    } as any);

    const result = await requestNotificationPermissions();

    expect(result).toBe(true);
    expect(mockNotifee.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('권한 미승인 상태에서 사용자가 거부하면 false를 반환해야 한다.', async () => {
    mockNotifee.requestPermission.mockResolvedValue({
      authorizationStatus: AuthorizationStatus.DENIED,
    } as any);

    const result = await requestNotificationPermissions();

    expect(result).toBe(false);
  });
});

describe('scheduleLocalNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifee.requestPermission.mockResolvedValue({
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
    } as any);
    mockNotifee.createChannel.mockResolvedValue('default');
    mockNotifee.createTriggerNotification.mockResolvedValue(undefined as any);
  });

  it('권한이 있을 때 알림을 예약하고 true를 반환해야 한다.', async () => {
    const result = await scheduleLocalNotification({
      title: '테스트 알림',
      body: '알림 내용',
      seconds: 60,
    });

    expect(result).toBe(true);
    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledTimes(1);
    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '테스트 알림',
        body: '알림 내용',
      }),
      expect.objectContaining({
        type: TriggerType.TIMESTAMP,
      }),
    );
  });

  it('권한이 없을 때 알림 예약 없이 false를 반환해야 한다.', async () => {
    mockNotifee.requestPermission.mockResolvedValue({
      authorizationStatus: AuthorizationStatus.DENIED,
    } as any);

    const result = await scheduleLocalNotification({
      title: '테스트 알림',
      body: '알림 내용',
      seconds: 60,
    });

    expect(result).toBe(false);
    expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
  });

  it('seconds=0 으로 즉시 알림을 예약할 수 있어야 한다.', async () => {
    const result = await scheduleLocalNotification({
      title: '즉시 알림',
      body: '지금 발생',
      seconds: 0,
    });

    expect(result).toBe(true);
    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({ title: '즉시 알림' }),
      expect.objectContaining({ type: TriggerType.TIMESTAMP }),
    );
  });
});

describe('useDepositNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifee.requestPermission.mockResolvedValue({
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
    } as any);
    mockNotifee.createChannel.mockResolvedValue('default');
    mockNotifee.createTriggerNotification.mockResolvedValue(undefined as any);
  });

  it('권한이 있을 때 scheduleMaturityAlarm은 true를 반환해야 한다.', async () => {
    const { result } = renderHook(() => useDepositNotification());
    let outcome: boolean | undefined;

    await act(async () => {
      outcome = await result.current.scheduleMaturityAlarm(86400);
    });

    expect(outcome).toBe(true);
    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '락파이 만기 알림',
      }),
      expect.objectContaining({ type: TriggerType.TIMESTAMP }),
    );
  });

  it('권한이 없을 때 scheduleMaturityAlarm은 false를 반환해야 한다.', async () => {
    mockNotifee.requestPermission.mockResolvedValue({
      authorizationStatus: AuthorizationStatus.DENIED,
    } as any);

    const { result } = renderHook(() => useDepositNotification());
    let outcome: boolean | undefined;

    await act(async () => {
      outcome = await result.current.scheduleMaturityAlarm(86400);
    });

    expect(outcome).toBe(false);
    expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
  });

  it('scheduleMaturityAlarm은 duration을 그대로 seconds로 전달해야 한다.', async () => {
    const { result } = renderHook(() => useDepositNotification());
    const testDuration = 2592000;

    await act(async () => {
      await result.current.scheduleMaturityAlarm(testDuration);
    });

    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({ title: '락파이 만기 알림' }),
      expect.objectContaining({ type: TriggerType.TIMESTAMP }),
    );
  });
});
