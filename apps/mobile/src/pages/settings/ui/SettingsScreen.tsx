import { AppDataSettingsSection } from '@features/app-data-settings';
import { NotificationSettingsSection } from '@features/notification-settings';
import { SubscriptionSection } from '@features/subscription-management';
import { ScreenTitle } from '@shared/ui';
import { AppInfoSection } from '@widgets/app-info';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
