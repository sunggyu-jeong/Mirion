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
        <ScreenTitle>이용약관 및 정보 제공 고지</ScreenTitle>

        <Section
          title="1. 서비스 성격 안내"
          body="LockFi는 온체인 데이터를 시각화하여 제공하는 정보 제공 서비스입니다. 귀하의 자산을 직접 보관하거나 관리하지 않습니다."
        />
        <Section
          title="2. 데이터 정확성"
          body="제공되는 온체인 데이터는 실시간 블록체인 정보를 기반으로 하지만, 네트워크 지연이나 데이터 소스의 오류로 인해 실제 정보와 차이가 있을 수 있습니다."
        />
        <Section
          title="3. 투자 책임 고지"
          body="본 서비스에서 제공하는 정보는 투자 권유가 아닙니다. 모든 투자 결정은 본인의 책임하에 이루어져야 하며, LockFi는 투자 결과에 대해 책임을 지지 않습니다."
        />
        <Section
          title="4. 개인정보 보호"
          body="LockFi는 사용자의 개인키를 요구하거나 수집하지 않습니다. 공개된 지갑 주소 정보만을 활용하여 데이터를 제공합니다."
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
            위 내용을 모두 확인했으며, 서비스 이용 조건에 동의합니다.
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
