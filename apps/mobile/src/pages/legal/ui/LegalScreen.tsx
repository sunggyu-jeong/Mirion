import { useAppNavigation } from '@shared/lib/navigation';
import { LEGAL_ACCEPTED_KEY, storage } from '@shared/lib/storage';
import { PrimaryButton, ScreenTitle } from '@shared/ui';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1d293d', lineHeight: 21 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 13, fontWeight: '400', color: '#62748e', lineHeight: 20 }}>
        {body}
      </Text>
    </View>
  );
}

export function LegalScreen() {
  const { toOnboarding } = useAppNavigation();
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    storage.set(LEGAL_ACCEPTED_KEY, '1');
    toOnboarding();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 32,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle>이용약관 및 위험 고지</ScreenTitle>

        <Section
          title="1. 비수탁형 서비스 안내"
          body="LockFi는 귀하의 자산을 직접 보관하거나 관리하지 않습니다. 모든 자산은 Lido 스마트 컨트랙트에 직접 예치되며, LockFi는 귀하의 개인키 또는 자산에 접근할 수 없습니다."
        />
        <Section
          title="2. 스마트 컨트랙트 위험"
          body="스테이킹은 스마트 컨트랙트를 통해 이루어집니다. 스마트 컨트랙트에는 버그나 취약점이 존재할 수 있으며, 이로 인한 손실에 대해 LockFi는 책임을 지지 않습니다."
        />
        <Section
          title="3. 슬래싱(Slashing) 위험"
          body="Lido를 통한 이더리움 스테이킹은 검증자 노드 운영과 연결됩니다. 검증자가 슬래싱을 당할 경우 스테이킹된 ETH의 일부가 손실될 수 있습니다."
        />
        <Section
          title="4. 수익률 미보장"
          body="표시되는 예상 APY는 과거 데이터 기반의 추정치이며, 실제 수익을 보장하지 않습니다. 시장 상황에 따라 수익률은 언제든 변동될 수 있습니다."
        />
        <Section
          title="5. 자산 손실 가능성"
          body="암호화폐는 높은 변동성을 가지며, 투자 원금 전액을 손실할 위험이 있습니다. 본인이 감당할 수 있는 범위 내에서만 스테이킹하시기 바랍니다."
        />
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          onPress={() => setAgreed(prev => !prev)}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              borderWidth: 1.5,
              borderColor: agreed ? '#2b7fff' : '#cad5e2',
              backgroundColor: agreed ? '#2b7fff' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {agreed && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />
            )}
          </View>
          <Text style={{ fontSize: 14, color: '#62748e', flex: 1 }}>
            위 내용을 모두 확인했으며, 위험을 이해하고 동의합니다.
          </Text>
        </Pressable>
        <PrimaryButton
          label="동의하고 시작하기"
          onPress={handleAccept}
          variant={agreed ? 'primary' : 'secondary'}
        />
      </View>
    </SafeAreaView>
  );
}
