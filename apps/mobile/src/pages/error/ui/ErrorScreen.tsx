import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton } from '@shared/ui';
import { AlertCircle } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ErrorScreen() {
  const { toMain } = useAppNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
          gap: 24,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 28,
            backgroundColor: '#fee2e2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertCircle
            size={40}
            color="#ef4444"
            strokeWidth={1.5}
          />
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172b' }}>
            오류가 발생했습니다
          </Text>
          <Text style={{ fontSize: 15, color: '#62748e', textAlign: 'center', lineHeight: 22 }}>
            예상치 못한 문제가 발생했습니다.{'\n'}앱을 다시 시작하거나 홈으로 이동해 주세요.
          </Text>
        </View>
        <PrimaryButton
          label="홈으로 돌아가기"
          onPress={toMain}
        />
      </View>
    </SafeAreaView>
  );
}
