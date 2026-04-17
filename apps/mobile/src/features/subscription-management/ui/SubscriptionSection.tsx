import { useSubscriptionStore } from '@entities/subscription';
import { Card, PrimaryButton, SectionTitle } from '@shared/ui';
import { BadgeCheck } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const PRO_BENEFITS = [
  '전체 고래 20+ 추적',
  '실시간 푸시 알림',
  '무제한 거래 내역',
  '정확한 자산 규모 공개',
];

export function SubscriptionSection() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const setPro = useSubscriptionStore(s => s.setPro);
  const setNotifications = useSubscriptionStore(s => s.setNotifications);

  const handleUpgrade = useCallback(() => setPro(true), [setPro]);
  const handleDowngrade = useCallback(() => {
    setPro(false);
    setNotifications(false);
  }, [setPro, setNotifications]);

  return (
    <Animated.View
      entering={FadeInDown.delay(0).duration(260)}
      style={{ gap: 12 }}
    >
      <SectionTitle title="구독 플랜" />

      {isPro ? (
        <Card>
          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <BadgeCheck
                size={20}
                color="#4ADE80"
                strokeWidth={2}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#4ADE80',
                  letterSpacing: -0.02,
                }}
              >
                프로 구독 중
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: 'rgba(74,222,128,0.7)', letterSpacing: -0.01 }}>
              모든 고래 추적과 실시간 알림이 활성화되어 있습니다
            </Text>
            <PrimaryButton
              label="구독 해제 (데모)"
              variant="secondary"
              onPress={handleDowngrade}
              height={40}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <View style={{ padding: 16, gap: 14 }}>
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: -0.03,
                }}
              >
                🔓 프로로 업그레이드
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: -0.01 }}>
                월 ₩9,900 · 언제든지 해지 가능
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {PRO_BENEFITS.map(b => (
                <View
                  key={b}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: '#2b7fff',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 10, color: 'white', fontWeight: '700' }}>✓</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: 'white',
                      letterSpacing: -0.01,
                    }}
                  >
                    {b}
                  </Text>
                </View>
              ))}
            </View>
            <PrimaryButton
              label="프로 시작하기 (데모)"
              onPress={handleUpgrade}
              height={44}
            />
          </View>
        </Card>
      )}
    </Animated.View>
  );
}
