import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton } from '@shared/ui';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';

import { WalletOption } from './WalletOption';

const metamaskIcon = require('../../../shared/assets/images/metamask.png');
const coinbaseIcon = require('../../../shared/assets/images/coinbase.png');

const SHEET_HEIGHT = 380;
const DISMISS_THRESHOLD = 100;

type WalletType = 'metamask' | 'coinbase';

export function WalletConnectScreen() {
  const [selected, setSelected] = useState<WalletType>('metamask');
  const { goBack, toWalletConnecting } = useAppNavigation();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(goBack);
  };

  const handleConnect = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      toWalletConnecting(selected);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 8,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          sheetTranslateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > DISMISS_THRESHOLD) {
          dismiss();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View className="flex-1 justify-end">
      <Animated.View
        className="absolute inset-0 bg-black"
        style={{ opacity: Animated.multiply(backdropOpacity, 0.5) }}
      />
      <Pressable
        className="absolute inset-0"
        onPress={dismiss}
      />
      <Animated.View
        className="bg-white rounded-[24px] mx-2 mb-8"
        style={{ transform: [{ translateY: sheetTranslateY }] }}
      >
        <View
          className="items-center pt-4 pb-2"
          {...panResponder.panHandlers}
        >
          <View className="w-[33px] h-[4px] bg-[#f1f5f9] rounded-full" />
        </View>
        <View className="items-center gap-y-5 pt-2 pb-4 px-4">
          <Text className="text-[20px] font-bold text-[#0f172b] leading-[1.3]">지갑 연결</Text>
          <View className="w-full gap-y-4 items-center">
            <View className="w-full gap-y-2">
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
          <Text className="text-[12px] text-[#62748e] text-center leading-[1.5]">
            {'로그인 시 이용약관과 '}
            <Text className="underline">개인정보 처리 방침</Text>
            {'에 동의하게 됩니다'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
