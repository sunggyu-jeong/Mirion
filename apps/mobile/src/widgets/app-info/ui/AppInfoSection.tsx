import { Card, SectionTitle, SettingRow } from '@shared/ui';
import { ChevronRight, ExternalLink, Mail, RefreshCw, Shield, Star } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Linking, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function AppInfoSection() {
  const openUrl = useCallback((url: string) => Linking.openURL(url), []);
  const openMail = useCallback(() => Linking.openURL('mailto:support@mirion.app'), []);

  return (
    <Animated.View
      entering={FadeInDown.delay(180).duration(260)}
      style={{ gap: 12 }}
    >
      <SectionTitle title="앱 정보" />
      <Card>
        <SettingRow
          icon={
            <RefreshCw
              size={15}
              color="#62748e"
              strokeWidth={2}
            />
          }
          label="버전"
          right={
            <Text style={{ fontSize: 13, fontWeight: '400', color: '#94a3b8' }}>1.0.0 (41)</Text>
          }
        />
        <SettingRow
          icon={
            <ExternalLink
              size={15}
              color="#62748e"
              strokeWidth={2}
            />
          }
          label="데이터 출처"
          right={
            <Text style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8' }}>
              Etherscan · CoinGecko
            </Text>
          }
          isLast
        />
      </Card>

      <Card>
        <SettingRow
          icon={
            <Shield
              size={15}
              color="#62748e"
              strokeWidth={2}
            />
          }
          label="개인정보 처리방침"
          onPress={() => openUrl('https://mirion.app/privacy')}
          right={
            <ChevronRight
              size={16}
              color="#cbd5e1"
              strokeWidth={1.8}
            />
          }
        />
        <SettingRow
          icon={
            <Shield
              size={15}
              color="#62748e"
              strokeWidth={2}
            />
          }
          label="이용약관"
          onPress={() => openUrl('https://mirion.app/terms')}
          right={
            <ChevronRight
              size={16}
              color="#cbd5e1"
              strokeWidth={1.8}
            />
          }
          isLast
        />
      </Card>

      <Card>
        <SettingRow
          icon={
            <Star
              size={15}
              color="#f59e0b"
              strokeWidth={2}
            />
          }
          label="리뷰 남기기"
          sub="앱이 마음에 드셨나요?"
          onPress={() => openUrl('https://apps.apple.com/app/id000000000')}
          right={
            <ChevronRight
              size={16}
              color="#cbd5e1"
              strokeWidth={1.8}
            />
          }
        />
        <SettingRow
          icon={
            <Mail
              size={15}
              color="#62748e"
              strokeWidth={2}
            />
          }
          label="문의하기"
          sub="support@mirion.app"
          onPress={openMail}
          right={
            <ChevronRight
              size={16}
              color="#cbd5e1"
              strokeWidth={1.8}
            />
          }
          isLast
        />
      </Card>
    </Animated.View>
  );
}

