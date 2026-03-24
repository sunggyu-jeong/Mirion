import { CB_SESSION_KEY, secureKey, useWalletStore, WC_SESSION_KEY } from '@entities/wallet';
import { useAppNavigation } from '@shared/lib/navigation';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export function SplashScreen() {
  const { toOnboarding, toStaking } = useAppNavigation();
  const setSession = useWalletStore(s => s.setSession);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const init = async () => {
      const hasWC = secureKey.has(WC_SESSION_KEY);
      const hasCB = secureKey.has(CB_SESSION_KEY);

      if (hasWC || hasCB) {
        const keyId = hasWC ? WC_SESSION_KEY : CB_SESSION_KEY;
        const walletType = hasWC ? 'walletconnect' : 'coinbase';
        const address = await secureKey.retrieveData(keyId);
        if (address) {
          setSession(address, walletType);
          toStaking();
          return;
        }
      }

      timer = setTimeout(toOnboarding, 2000);
    };

    init();

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-[#2b7fff] items-center justify-center">
      <Text className="text-[44px] font-black text-white tracking-[-1.135px]">LockFi</Text>
    </View>
  );
}
