import type { WhaleProfile } from '@entities/whale';
import { CHAIN_CONFIG } from '@entities/whale';
import { formatUsd } from '@shared/lib/format';
import { RollupText } from '@shared/ui/RollupText';
import { ArrowRight, Lock, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const PRESS_SPRING = { damping: 15, stiffness: 400 } as const;

const ACTIVITY_CONFIG = {
  buy: { label: '매수 중', color: '#4ADE80', Icon: TrendingUp, bg: 'rgba(74,222,128,0.12)' },
  sell: { label: '매도 중', color: '#F43F5E', Icon: TrendingDown, bg: 'rgba(244,63,94,0.12)' },
  transfer: { label: '이동 중', color: '#FB923C', Icon: ArrowRight, bg: 'rgba(251,146,60,0.12)' },
} as const;

type Props = {
  whale: WhaleProfile;
  isPro: boolean;
  onPress: (id: string) => void;
  onUpgrade: () => void;
};

export function WhaleCard({ whale, isPro, onPress, onUpgrade }: Props) {
  const isLocked = whale.isLocked && !isPro;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (isLocked) {
      onUpgrade();
    } else {
      onPress(whale.id);
    }
  }, [isLocked, onPress, onUpgrade, whale.id]);

  const config = ACTIVITY_CONFIG[whale.activityType];
  const { Icon } = config;
  const chainConfig = CHAIN_CONFIG[whale.chain];

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          {
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 24,
            padding: 20,
            gap: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            opacity: isLocked ? 0.6 : 1,
          },
          animatedStyle,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: 'white',
                letterSpacing: -0.4,
              }}
            >
              {whale.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                {whale.tag}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: chainConfig.color,
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {whale.chain}
                </Text>
              </View>
            </View>
          </View>

          {isLocked ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#06B6D4',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Lock
                size={12}
                color="white"
                strokeWidth={2.5}
              />
              <Text style={{ fontSize: 12, fontWeight: '800', color: 'white' }}>잠금</Text>
            </View>
          ) : (
            <ArrowRight
              size={20}
              color="rgba(255,255,255,0.45)"
              strokeWidth={2}
            />
          )}
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>
              총 자산
            </Text>
            {isLocked ? (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: -0.5,
                }}
              >
                ••••••
              </Text>
            ) : (
              <RollupText
                value={whale.totalValueUsd}
                formatter={formatUsd}
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: -0.5,
                }}
              />
            )}
          </View>

          <View
            style={{
              backgroundColor: isLocked ? 'rgba(255,255,255,0.06)' : config.bg,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon
              size={14}
              color={isLocked ? 'rgba(255,255,255,0.2)' : config.color}
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: isLocked ? 'rgba(255,255,255,0.2)' : config.color,
              }}
            >
              {config.label}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: isLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
            lineHeight: 19,
          }}
          numberOfLines={2}
        >
          {isLocked
            ? '구독 후 고래의 최근 활동을 확인하세요'
            : (whale.recentActivity ?? '최근 활동이 없어요')}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
