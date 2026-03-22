import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const icons = {
  metamask: require('../../../shared/assets/images/metamask.png'),
  coinbase: require('../../../shared/assets/images/coinbase.png'),
};

type WalletType = 'metamask' | 'coinbase';

export function SpinnerIcon({ walletType = 'metamask' }: { walletType?: WalletType }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      className="items-center justify-center"
      style={{ width: 70, height: 70 }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            position: 'absolute',
            width: 70,
            height: 70,
            borderRadius: 35,
            borderWidth: 3,
            borderTopColor: '#2b7fff',
            borderRightColor: '#2b7fff',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          },
        ]}
      />
      <View
        className="bg-[#f1f5f9] items-center justify-center"
        style={{ width: 66, height: 66, borderRadius: 33 }}
      >
        <Image
          source={icons[walletType]}
          style={{ width: 35, height: 35 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
