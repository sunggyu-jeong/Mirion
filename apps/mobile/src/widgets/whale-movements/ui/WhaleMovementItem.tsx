import type { WhaleTx } from '@entities/whale-tx';
import { getMagnitudeInfo } from '@entities/whale-tx';
import { formatEth, formatRelativeTime, formatUsd } from '@shared/lib/format';
import { haptic } from '@shared/lib/haptic';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Lock, RefreshCw } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TOSS_PRESS = { damping: 15, stiffness: 400 } as const;

const TX_TYPE_CONFIG = {
  send: { label: '대규모 전송', Icon: ArrowUpRight, color: '#fb2c36', bg: '#fff1f2' },
  receive: { label: '대규모 수신', Icon: ArrowDownLeft, color: '#22c55e', bg: '#f0fdf4' },
  swap: { label: '대규모 스왑', Icon: RefreshCw, color: '#f97316', bg: '#fff7ed' },
} as const;

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type Props = {
  item: WhaleTx;
  isNew?: boolean;
  isLocked?: boolean;
  onUpgrade?: () => void;
};

export function WhaleMovementItem({ item, isNew = false, isLocked = false, onUpgrade }: Props) {
  const scale = useSharedValue(1);
  const glowProgress = useSharedValue(0);
  const config = TX_TYPE_CONFIG[item.type];
  const { Icon } = config;
  const magnitude = getMagnitudeInfo(item.amountEth);

  useEffect(() => {
    if (!isNew) {
      return;
    }
    haptic.impact();
    glowProgress.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withDelay(220, withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })),
    );
  }, [isNew, glowProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: glowProgress.value > 0 ? 1.5 : 0,
    borderColor: interpolateColor(glowProgress.value, [0, 1], ['transparent', config.color]),
  }));

  const handleViewDetail = useCallback(() => {
    Linking.openURL(`https://etherscan.io/tx/${item.txHash}`);
  }, [item.txHash]);

  return (
    <Animated.View
      style={[
        { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 12 },
        animatedStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: config.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            size={18}
            color={config.color}
            strokeWidth={2}
          />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: '600', color: '#0f172b', letterSpacing: -0.02 }}
              >
                {config.label}
              </Text>
              <View
                style={{
                  backgroundColor: magnitude.bg,
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: magnitude.color }}>
                  {magnitude.label}
                </Text>
              </View>
            </View>
            <Text
              style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8', letterSpacing: -0.01 }}
            >
              {formatRelativeTime(item.timestampMs)}
            </Text>
          </View>
          <Text
            style={{ fontSize: 13, fontWeight: '500', color: config.color, letterSpacing: -0.01 }}
          >
            {isLocked ? '••••• ETH' : formatEth(item.amountEth)}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: '#62748e', letterSpacing: -0.01 }}>
            {isLocked ? '•••••' : formatUsd(item.amountUsd)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#f1f5f9',
          borderRadius: 8,
          padding: 10,
        }}
      >
        <Text
          style={{ fontSize: 11, fontWeight: '400', color: '#62748e', fontFamily: 'monospace' }}
          numberOfLines={1}
        >
          {isLocked ? '0x••••••...••••' : shortenAddress(item.fromAddress)}
        </Text>
        <ArrowRight
          size={12}
          color="#94a3b8"
          strokeWidth={2}
        />
        <Text
          style={{ fontSize: 11, fontWeight: '400', color: '#62748e', fontFamily: 'monospace' }}
          numberOfLines={1}
        >
          {isLocked ? '0x••••••...••••' : shortenAddress(item.toAddress)}
        </Text>
      </View>

      {isLocked ? (
        <Pressable
          onPress={onUpgrade}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: '#0f172b',
          }}
        >
          <Lock
            size={12}
            color="white"
            strokeWidth={2}
          />
          <Text style={{ fontSize: 13, fontWeight: '600', color: 'white', letterSpacing: -0.02 }}>
            PRO로 잠금 해제
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.97, TOSS_PRESS);
          }}
          onPressOut={() => {
            scale.value = withSpring(1, TOSS_PRESS);
          }}
          onPress={handleViewDetail}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            backgroundColor: 'white',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#2b7fff', letterSpacing: -0.02 }}>
            거래 상세 보기
          </Text>
          <ArrowUpRight
            size={14}
            color="#2b7fff"
            strokeWidth={2}
          />
        </Pressable>
      )}
    </Animated.View>
  );
}

export function WhaleMovementItemSeparator() {
  return (
    <Animated.View
      entering={withTiming as never}
      style={{ height: 12 }}
    />
  );
}

export function RadarPulse() {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) });
    const interval = setInterval(() => {
      opacity.value = withTiming(opacity.value < 0.5 ? 1 : 0.3, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }, pulseStyle]}
    />
  );
}
