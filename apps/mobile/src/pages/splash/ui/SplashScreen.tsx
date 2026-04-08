import { useAppNavigation } from '@shared/lib/navigation';
import { LEGAL_ACCEPTED_KEY, ONBOARDING_SEEN_KEY, storage } from '@shared/lib/storage';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export function SplashScreen() {
  const { toOnboarding, toMain, toLegal } = useAppNavigation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const init = () => {
      const onboardingSeen = storage.getString(ONBOARDING_SEEN_KEY);
      if (onboardingSeen) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-[#2b7fff] items-center justify-center">
      <Text className="text-[44px] font-black text-white tracking-[-1.135px]">WhaleTracker</Text>
      <Text className="text-[14px] text-white/70 tracking-[-0.02px] mt-2">고래를 따라가세요</Text>
    </View>
  );
}
