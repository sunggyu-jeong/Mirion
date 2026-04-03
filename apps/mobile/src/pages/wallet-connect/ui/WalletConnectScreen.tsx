import { useAppNavigation } from '@shared/lib/navigation';
import type { BottomSheetRef } from '@shared/ui';
import { BottomSheet, PrimaryButton } from '@shared/ui';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { WalletOption } from './WalletOption';

const metamaskIcon = require('../../../shared/assets/images/metamask.png');
const coinbaseIcon = require('../../../shared/assets/images/coinbase.png');

const SHEET_HEIGHT = 380;
const DISMISS_THRESHOLD = 100;

type WalletType = 'metamask' | 'coinbase';

export function WalletConnectScreen() {
  const [selected, setSelected] = useState<WalletType>('metamask');
  const { goBack, toMain } = useAppNavigation();
  const sheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    sheetRef.current?.open();
  }, []);

  const handleConnect = () => {
    sheetRef.current?.close(toMain);
  };

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        ref={sheetRef}
        height={SHEET_HEIGHT}
        dismissThreshold={DISMISS_THRESHOLD}
        onDismiss={goBack}
        bottomInset={32}
        horizontalInset={8}
      >
        <View
          style={{
            alignItems: 'center',
            gap: 20,
            paddingTop: 8,
            paddingBottom: 16,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172b', lineHeight: 26 }}>
            지갑 연결
          </Text>
          <View style={{ width: '100%', gap: 16, alignItems: 'center' }}>
            <View style={{ width: '100%', gap: 8 }}>
              <WalletOption
                label="MetaMask"
                icon={metamaskIcon}
                selected={selected === 'metamask'}
                onPress={() => setSelected('metamask')}
              />
              <WalletOption
                label="Coinbase Wallet"
                icon={coinbaseIcon}
                selected={selected === 'coinbase'}
                onPress={() => setSelected('coinbase')}
              />
            </View>
            <PrimaryButton
              label="연결하기"
              height={44}
              onPress={handleConnect}
            />
          </View>
          <Text style={{ fontSize: 12, color: '#62748e', textAlign: 'center', lineHeight: 18 }}>
            {'로그인 시 이용약관과 '}
            <Text style={{ textDecorationLine: 'underline' }}>개인정보 처리 방침</Text>
            {'에 동의하게 됩니다'}
          </Text>
        </View>
      </BottomSheet>
    </View>
  );
}
