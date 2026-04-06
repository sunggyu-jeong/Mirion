import { useAppNavigation } from '@shared/lib/navigation';
import { ONBOARDING_SEEN_KEY, storage } from '@shared/lib/storage';
import { PrimaryButton } from '@shared/ui';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const FEATURES = [
  { emoji: '🐋', title: '실시간 고래 추적', desc: '세계 최대 규모 투자자들의 매수·매도 포착' },
  { emoji: '📊', title: '포트폴리오 분석', desc: '고래의 자산 구성과 비중을 한눈에 파악' },
  { emoji: '🔔', title: '즉시 알림 (PRO)', desc: '대규모 이체 발생 시 실시간 푸시 수신' },
];

export function OnboardingScreen() {
  const { toMain } = useAppNavigation();

  const handleStart = useCallback(() => {
    storage.set(ONBOARDING_SEEN_KEY, 'true');
    toMain();
  }, [toMain]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        <Animated.View
          entering={FadeInUp.delay(0).duration(320).easing(EASE_OUT)}
          style={{ alignItems: 'center', marginBottom: 48 }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🐋</Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#0f172b',
              letterSpacing: -0.56,
              textAlign: 'center',
              lineHeight: 36,
            }}
          >
            {'고래의 움직임을\n먼저 알아채세요'}
          </Text>
          <View style={{ height: 12 }} />
          <Text
            style={{
              fontSize: 15,
              fontWeight: '400',
              color: '#62748e',
              textAlign: 'center',
              lineHeight: 22,
              letterSpacing: -0.02,
            }}
          >
            {'대형 투자자들이 무엇을 사고 파는지\n실시간으로 모니터링합니다'}
          </Text>
        </Animated.View>

        <View style={{ gap: 14 }}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.title}
              entering={FadeInDown.delay(120 + i * 80)
                .duration(260)
                .easing(EASE_OUT)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: '#f8fafc',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 26 }}>{f.emoji}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#0f172b',
                    letterSpacing: -0.02,
                  }}
                >
                  {f.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '400',
                    color: '#62748e',
                    letterSpacing: -0.01,
                  }}
                >
                  {f.desc}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(400).duration(260).easing(EASE_OUT)}
        style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
      >
        <PrimaryButton
          label="무료로 시작하기"
          onPress={handleStart}
          height={52}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: '400',
            color: '#94a3b8',
            textAlign: 'center',
            letterSpacing: -0.01,
          }}
        >
          무료 플랜은 3개 고래 · 최근 3건 내역 제공
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
