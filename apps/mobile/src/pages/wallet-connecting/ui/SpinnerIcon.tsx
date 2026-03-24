import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const icons = {
  metamask: require('../../../shared/assets/images/metamask.png'),
  coinbase: require('../../../shared/assets/images/coinbase.png'),
};

type WalletType = 'metamask' | 'coinbase';

export function SpinnerIcon({ walletType = 'metamask' }: { walletType?: WalletType }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    scale.value = withSpring(1, { damping: 12 });
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[scaleStyle, { width: 69, height: 69, alignItems: 'center', justifyContent: 'center' }]}
    >
      <Animated.View
        style={[
          rotateStyle,
          {
            position: 'absolute',
            width: 69,
            height: 69,
            borderRadius: 34.5,
            borderWidth: 3,
            borderTopColor: '#2b7fff',
            borderRightColor: 'transparent',
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
    </Animated.View>
  );
}
