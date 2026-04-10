import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import { Card, LabelRow, SectionTitle, SegmentedControl, SettingRow } from '@shared/ui';
import { Bell, BellOff, MoonStar } from 'lucide-react-native';
import React from 'react';
import { Switch } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ETH_OPTIONS = [
  { label: '100 ETH', value: 100 as const },
  { label: '500 ETH', value: 500 as const },
  { label: '1,000 ETH', value: 1000 as const },
];

export function NotificationSettingsSection() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const notificationsEnabled = useSubscriptionStore(s => s.notificationsEnabled);
  const setNotifications = useSubscriptionStore(s => s.setNotifications);

  const quietHoursEnabled = useAppSettingsStore(s => s.quietHoursEnabled);
  const alertMinEth = useAppSettingsStore(s => s.alertMinEth);
  const setQuietHours = useAppSettingsStore(s => s.setQuietHours);
  const setAlertMinEth = useAppSettingsStore(s => s.setAlertMinEth);

  return (
    <Animated.View
      entering={FadeInDown.delay(60).duration(260)}
      style={{ gap: 12 }}
    >
      <SectionTitle title="알림 설정" />
      <Card>
        <SettingRow
          icon={
            notificationsEnabled ? (
              <Bell
                size={16}
                color="#2b7fff"
                strokeWidth={2}
              />
            ) : (
              <BellOff
                size={16}
                color="#94a3b8"
                strokeWidth={2}
              />
            )
          }
          label="대규모 이체 알림"
          sub={isPro ? undefined : '프로 전용 기능'}
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={isPro ? setNotifications : undefined}
              trackColor={{ false: '#e2e8f0', true: '#2b7fff' }}
              thumbColor="white"
              disabled={!isPro}
            />
          }
        />
        <SettingRow
          icon={
            <MoonStar
              size={16}
              color={quietHoursEnabled ? '#7c3aed' : '#94a3b8'}
              strokeWidth={2}
            />
          }
          label="방해 금지 모드"
          sub="밤 12시 ~ 오전 7시"
          isLast
          right={
            <Switch
              value={quietHoursEnabled}
              onValueChange={isPro ? setQuietHours : undefined}
              trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
              thumbColor="white"
              disabled={!isPro}
            />
          }
        />
      </Card>

      {notificationsEnabled && isPro && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 10 }}
        >
          <LabelRow label="최소 알림 기준금액">
            <SegmentedControl
              options={ETH_OPTIONS}
              value={alertMinEth}
              onChange={setAlertMinEth}
            />
          </LabelRow>
        </Animated.View>
      )}
    </Animated.View>
  );
}
