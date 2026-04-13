import { useAppSettingsStore } from '@entities/app-settings';
import { LabelRow, SectionTitle, SegmentedControl } from '@shared/ui';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const REFRESH_OPTIONS = [
  { label: '15초', value: 15 as const },
  { label: '30초', value: 30 as const },
  { label: '1분', value: 60 as const },
  { label: '5분', value: 300 as const },
];

const ETH_OPTIONS = [
  { label: '100 ETH', value: 100 as const },
  { label: '500 ETH', value: 500 as const },
  { label: '1,000 ETH', value: 1000 as const },
];

const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' as const },
  { label: 'KRW', value: 'KRW' as const },
];

export function AppDataSettingsSection() {
  const refreshInterval = useAppSettingsStore(s => s.refreshInterval);
  const minDetectionEth = useAppSettingsStore(s => s.minDetectionEth);
  const currency = useAppSettingsStore(s => s.currency);
  const setRefreshInterval = useAppSettingsStore(s => s.setRefreshInterval);
  const setMinDetectionEth = useAppSettingsStore(s => s.setMinDetectionEth);
  const setCurrency = useAppSettingsStore(s => s.setCurrency);

  return (
    <Animated.View
      entering={FadeInDown.delay(120).duration(260)}
      style={{ gap: 12 }}
    >
      <SectionTitle title="데이터 설정" />
      <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 16 }}>
        <LabelRow label="갱신 주기">
          <SegmentedControl
            options={REFRESH_OPTIONS}
            value={refreshInterval}
            onChange={setRefreshInterval}
          />
        </LabelRow>
        <LabelRow label="최소 감지 기준금액">
          <SegmentedControl
            options={ETH_OPTIONS}
            value={minDetectionEth}
            onChange={setMinDetectionEth}
          />
        </LabelRow>
        <LabelRow label="표시 통화">
          <SegmentedControl
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={setCurrency}
          />
        </LabelRow>
      </View>
    </Animated.View>
  );
}
