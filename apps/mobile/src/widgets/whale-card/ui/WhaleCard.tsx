import type { WhaleProfile } from '@entities/whale';
import { CHAIN_CONFIG } from '@entities/whale';
import { formatUsd } from '@shared/lib/format';
import { RollupText } from '@shared/ui/RollupText';
import { ArrowRight, Lock, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const TOSS_PRESS = { damping: 15, stiffness: 400 } as const;

const ACTIVITY_CONFIG = {
  buy: { label: '매수', color: '#22c55e', Icon: TrendingUp },
  sell: { label: '매도', color: '#fb2c36', Icon: TrendingDown },
  transfer: { label: '전송', color: '#f97316', Icon: ArrowRight },
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
        scale.value = withSpring(0.97, TOSS_PRESS);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, TOSS_PRESS);
      }}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          {
            backgroundColor: '#f8fafc',
            borderRadius: 20,
            padding: 18,
            gap: 14,
            opacity: isLocked ? 0.72 : 1,
          },
          animatedStyle,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#0f172b',
                letterSpacing: -0.03,
              }}
            >
              {whale.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#94a3b8',
                  letterSpacing: -0.01,
                }}
              >
                {whale.tag}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  backgroundColor: `${chainConfig.color}18`,
                  borderRadius: 4,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: chainConfig.color,
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: chainConfig.color,
                    letterSpacing: 0.2,
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
                gap: 4,
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Lock
                size={12}
                color="#94a3b8"
                strokeWidth={2}
              />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>PRO</Text>
            </View>
          ) : (
            <ArrowRight
              size={18}
              color="#94a3b8"
              strokeWidth={1.8}
            />
          )}
        </View>

        <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ gap: 3 }}>
            <Text
              style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8', letterSpacing: -0.01 }}
            >
              총 자산
            </Text>
            {isLocked ? (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#94a3b8',
                  letterSpacing: -0.03,
                }}
              >
                ****
              </Text>
            ) : (
              <RollupText
                value={whale.totalValueUsd}
                formatter={formatUsd}
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#0f172b',
                  letterSpacing: -0.03,
                }}
              />
            )}
          </View>

          <View
            style={{
              backgroundColor: isLocked ? '#f1f5f9' : `${config.color}18`,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Icon
              size={13}
              color={isLocked ? '#94a3b8' : config.color}
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isLocked ? '#94a3b8' : config.color,
                letterSpacing: -0.01,
              }}
            >
              {config.label}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 12,
            fontWeight: '400',
            color: isLocked ? '#cbd5e1' : '#62748e',
            letterSpacing: -0.01,
          }}
          numberOfLines={1}
        >
          {isLocked ? '구독 후 최근 활동 확인 가능' : (whale.recentActivity ?? '—')}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
