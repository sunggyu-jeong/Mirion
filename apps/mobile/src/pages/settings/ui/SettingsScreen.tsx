import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import { PrimaryButton, ScreenTitle, SectionTitle, SegmentedControl } from '@shared/ui';
import {
  BadgeCheck,
  Bell,
  BellOff,
  ChevronRight,
  ExternalLink,
  Mail,
  MoonStar,
  RefreshCw,
  Shield,
  Star,
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const PRO_BENEFITS = [
  '전체 고래 20+ 추적',
  '실시간 푸시 알림',
  '무제한 거래 내역',
  '정확한 자산 규모 공개',
];

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

function SettingRow({
  icon,
  label,
  sub,
  right,
  onPress,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: '#f1f5f9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172b', letterSpacing: -0.02 }}>
          {label}
        </Text>
        {sub ? (
          <Text style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8', letterSpacing: -0.01 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );

  if (!onPress) {
    return inner;
  }
  return <Pressable onPress={onPress}>{inner}</Pressable>;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

function LabelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: '#62748e', letterSpacing: -0.01 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const notificationsEnabled = useSubscriptionStore(s => s.notificationsEnabled);
  const setPro = useSubscriptionStore(s => s.setPro);
  const setNotifications = useSubscriptionStore(s => s.setNotifications);

  const refreshInterval = useAppSettingsStore(s => s.refreshInterval);
  const minDetectionEth = useAppSettingsStore(s => s.minDetectionEth);
  const currency = useAppSettingsStore(s => s.currency);
  const quietHoursEnabled = useAppSettingsStore(s => s.quietHoursEnabled);
  const alertMinEth = useAppSettingsStore(s => s.alertMinEth);
  const setRefreshInterval = useAppSettingsStore(s => s.setRefreshInterval);
  const setMinDetectionEth = useAppSettingsStore(s => s.setMinDetectionEth);
  const setCurrency = useAppSettingsStore(s => s.setCurrency);
  const setQuietHours = useAppSettingsStore(s => s.setQuietHours);
  const setAlertMinEth = useAppSettingsStore(s => s.setAlertMinEth);

  const handleUpgrade = useCallback(() => setPro(true), [setPro]);
  const handleDowngrade = useCallback(() => {
    setPro(false);
    setNotifications(false);
  }, [setPro, setNotifications]);

  const openUrl = useCallback((url: string) => Linking.openURL(url), []);
  const openMail = useCallback(() => Linking.openURL('mailto:support@whaletracker.app'), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle style={{ marginBottom: 28 }}>설정</ScreenTitle>

        <View style={{ gap: 32 }}>
          {/* 구독 플랜 */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}
            style={{ gap: 12 }}
          >
            <SectionTitle title="구독 플랜" />

            {isPro ? (
              <Card>
                <View style={{ padding: 16, gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <BadgeCheck
                      size={20}
                      color="#22c55e"
                      strokeWidth={2}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#15803d',
                        letterSpacing: -0.02,
                      }}
                    >
                      프로 구독 중
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#16a34a', letterSpacing: -0.01 }}>
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
                        color: '#0f172b',
                        letterSpacing: -0.03,
                      }}
                    >
                      🔓 프로로 업그레이드
                    </Text>
                    <Text style={{ fontSize: 13, color: '#62748e', letterSpacing: -0.01 }}>
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
                            color: '#0f172b',
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

          {/* 알림 설정 (Pro) */}
          <Animated.View
            entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}
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
                entering={FadeInDown.duration(200).easing(EASE_OUT)}
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

          {/* 데이터 설정 */}
          <Animated.View
            entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}
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

          {/* 앱 정보 */}
          <Animated.View
            entering={FadeInDown.delay(180).duration(260).easing(EASE_OUT)}
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
                  <Text style={{ fontSize: 13, fontWeight: '400', color: '#94a3b8' }}>
                    1.0.0 (41)
                  </Text>
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
                onPress={() => openUrl('https://whaletracker.app/privacy')}
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
                onPress={() => openUrl('https://whaletracker.app/terms')}
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
                sub="support@whaletracker.app"
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
