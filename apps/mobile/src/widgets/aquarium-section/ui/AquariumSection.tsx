import type { WhaleProfile } from '@entities/whale';
import { CHAIN_CONFIG } from '@entities/whale';
import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const PRESS_SPRING = { damping: 15, stiffness: 400 } as const;
const CARD_WIDTH = 136;

const TAG_EMOJI: Record<string, string> = {
  'ETH 창시자': '🧙',
  '기관 투자자': '🏦',
  '대형 투자자': '🐋',
  헤지펀드: '🎯',
  거래소: '🏪',
  'ETF 운용사': '📊',
  마켓메이커: '⚡',
  '익명 투자자': '🎭',
  '익명 고래': '🐳',
  'BNB 재단': '🔶',
};

function getEmoji(tag: string): string {
  for (const key of Object.keys(TAG_EMOJI)) {
    if (tag.includes(key)) {
      return TAG_EMOJI[key] ?? '🐋';
    }
  }
  return '🐋';
}

function truncateAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface AquariumCardProps {
  whale: WhaleProfile;
  onPress: (id: string) => void;
}

function AquariumCard({ whale, onPress }: AquariumCardProps) {
  const scale = useSharedValue(1);
  const chainConfig = CHAIN_CONFIG[whale.chain];
  const emoji = getEmoji(whale.tag);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    onPress(whale.id);
  }, [onPress, whale.id]);

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          {
            width: CARD_WIDTH,
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 16,
            gap: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.05,
            shadowRadius: 16,
            elevation: 3,
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: `${chainConfig.color}15`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>

        <View style={{ gap: 3 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: '#0f172b',
              letterSpacing: -0.3,
            }}
            numberOfLines={1}
          >
            {whale.name}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '400',
              color: '#94a3b8',
              letterSpacing: 0.1,
            }}
            numberOfLines={1}
          >
            {truncateAddress(whale.address)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: `${chainConfig.color}15`,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            alignSelf: 'flex-start',
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
              letterSpacing: 0.3,
            }}
          >
            {whale.chain}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

interface AquariumSectionProps {
  whales: WhaleProfile[];
  onWhalePress: (id: string) => void;
}

export function AquariumSection({ whales, onWhalePress }: AquariumSectionProps) {
  const renderItem = useCallback(
    ({ item }: { item: WhaleProfile }) => (
      <AquariumCard
        whale={item}
        onPress={onWhalePress}
      />
    ),
    [onWhalePress],
  );

  if (whales.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}>
          내 수족관
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
          {whales.length}마리
        </Text>
      </View>

      <FlatList
        data={whales}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        contentContainerStyle={{ paddingRight: 4 }}
      />
    </View>
  );
}
