import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { ErrorStateView } from '@shared/ui';
import { PrimaryButton } from '@shared/ui';
import { Info, Wallet, WifiOff } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ErrorParams = { errorType: 'network' | 'transaction' | 'balance' };

const ERROR_CONFIG = {
  network: {
    icon: <WifiOff size={28} color="#62748e" />,
    iconBg: '#f1f5f9',
    title: '네트워크 연결 오류',
    description: ['인터넷 연결을 확인해주세요', '네트워크가 불안정합니다'],
  },
  transaction: {
    icon: <Info size={28} color="#fb2c36" />,
    iconBg: '#fef2f2',
    title: '트랜잭션 실패',
    description: ['트랜잭션을 처리하던 중 오류가 발생했습니다', '지갑 잔액과 가스비를 확인해주세요'],
  },
  balance: {
    icon: <Wallet size={28} color="#62748e" />,
    iconBg: '#f1f5f9',
    title: '잔액이 부족합니다',
    description: ['예치하는 금액보다 지갑 잔액이 부족합니다', '금액을 조정하거나 지갑에 ETH를 충전해주세요'],
  },
} as const;

export function ErrorScreen() {
  const route = useRoute<RouteProp<{ Error: ErrorParams }, 'Error'>>();
  const { errorType } = route.params;
  const { goBack, toMain } = useAppNavigation();

  const config = ERROR_CONFIG[errorType];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <ErrorStateView
          icon={config.icon}
          iconBg={config.iconBg}
          title={config.title}
          description={config.description}
        />
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 8 }}>
        <PrimaryButton
          label="다시 시도"
          onPress={goBack}
        />
        <PrimaryButton
          label="돌아가기"
          variant="secondary"
          onPress={toMain}
        />
      </View>
    </SafeAreaView>
  );
}
