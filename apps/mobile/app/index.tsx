import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Redirect } from '@/.expo/types/router';

export default function SplashScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      setTimeout(() => setIsReady(true), 1500);
    };
    prepareApp();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator
          size="large"
          color="white"
        />
      </View>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}
