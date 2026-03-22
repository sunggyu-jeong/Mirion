import { useAppNavigation } from '@shared/lib/navigation';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export function SplashScreen() {
  const { toOnboarding } = useAppNavigation();

  useEffect(() => {
    const timer = setTimeout(toOnboarding, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-[#2b7fff] items-center justify-center">
      <Text className="text-[44px] font-black text-white tracking-[-1.135px]">LockFi</Text>
    </View>
  );
}
