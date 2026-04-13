import { useSubscriptionStore } from '@entities/subscription';
import { AppDataSettingsSection } from '@features/app-data-settings';
import { NotificationSettingsSection } from '@features/notification-settings';
import { SubscriptionSection } from '@features/subscription-management';
import { ScreenTitle } from '@shared/ui';
import { AppInfoSection } from '@widgets/app-info';
import React from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const setPro = useSubscriptionStore(s => s.setPro);

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle style={{ marginBottom: 28 }}>설정</ScreenTitle>

        <View style={{ gap: 32 }}>
          <SubscriptionSection />
          <NotificationSettingsSection />
          <AppDataSettingsSection />
          <AppInfoSection />
          {__DEV__ && (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#fbbf24',
                borderRadius: 16,
                padding: 16,
                gap: 12,
                backgroundColor: '#fffbeb',
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: '700', color: '#b45309', letterSpacing: 0.5 }}
              >
                DEV ONLY
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>PRO 모드</Text>
                <Switch
                  value={isPro}
                  onValueChange={setPro}
                  trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                  thumbColor="white"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
