import { CB_SESSION_KEY, useWalletStore, WC_SESSION_KEY } from '@entities/wallet';
import { LEGAL_ACCEPTED_KEY } from '@pages/legal';
import { useAppNavigation } from '@shared/lib/navigation';
import { storage } from '@shared/lib/storage';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export function SplashScreen() {
  const { toOnboarding, toMain, toLegal } = useAppNavigation();
  const setSession = useWalletStore(s => s.setSession);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const init = () => {
      const wcAddress = storage.getString(WC_SESSION_KEY);
      const cbAddress = storage.getString(CB_SESSION_KEY);

      if (wcAddress) {
        setSession(wcAddress, 'walletconnect');
        toMain();
        return;
      }
      if (cbAddress) {
        setSession(cbAddress, 'coinbase');
        toMain();
        return;
      }

      const legalAccepted = storage.getString(LEGAL_ACCEPTED_KEY);
      if (!legalAccepted) {
        timer = setTimeout(toLegal, 2000);
        return;
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
