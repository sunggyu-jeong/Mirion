import { useAppNavigation } from '@shared/lib/navigation';
import { ONBOARDING_SEEN_KEY, storage } from '@shared/lib/storage';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🐋',
    title: '고래를\n따라가세요',
    subtitle: '전 세계 최대 규모 투자자들의\n매수·매도를 실시간으로 포착합니다',
    accentColor: '#2b7fff',
    bgColor: '#eff6ff',
  },
  {
    id: '2',
    emoji: '📡',
    title: '실시간\n이동 레이더',
    subtitle: '100 ETH 이상 대규모 이체를 즉시 감지\n누가 무엇을 움직이는지 먼저 알 수 있습니다',
    accentColor: '#22c55e',
    bgColor: '#f0fdf4',
  },
  {
    id: '3',
    emoji: '📈',
    title: 'ETH 가격과\n고래 시그널',
    subtitle: '차트 위 고래 이체 마커로\n가격 변동의 선행 신호를 확인하세요',
    accentColor: '#f59e0b',
    bgColor: '#fefce8',
  },
  {
    id: '4',
    emoji: '🔓',
    title: 'PRO로\n더 깊이',
    subtitle: '20+ 고래 추적 · 무제한 내역\n실시간 푸시 알림까지 모두 해제됩니다',
    accentColor: '#a855f7',
    bgColor: '#fdf4ff',
  },
];

function SlideItem({ item }: { item: Slide }) {
  return (
    <View
      style={{
        width: SCREEN_W,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 0,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 36,
          backgroundColor: item.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 36,
        }}
      >
        <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
      </View>

      <Text
        style={{
          fontSize: 34,
          fontWeight: '900',
          color: '#0f172b',
          letterSpacing: -1,
          textAlign: 'center',
          lineHeight: 42,
          marginBottom: 16,
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '400',
          color: '#62748e',
          textAlign: 'center',
          lineHeight: 23,
          letterSpacing: -0.02,
        }}
      >
        {item.subtitle}
      </Text>
    </View>
  );
}

function Dot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const progress = useSharedValue(index === 0 ? 1 : 0);

  const style = useAnimatedStyle(() => {
    progress.value = withTiming(activeIndex === index ? 1 : 0, {
      duration: 220,
      easing: EASE_OUT,
    });
    return {
      width: interpolate(progress.value, [0, 1], [7, 22]),
      opacity: interpolate(progress.value, [0, 1], [0.3, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 7,
          borderRadius: 4,
          backgroundColor: SLIDES[activeIndex]?.accentColor ?? '#2b7fff',
        },
        style,
      ]}
    />
  );
}

export function OnboardingScreen() {
  const { toMain } = useAppNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const buttonScale = useSharedValue(1);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      storage.set(ONBOARDING_SEEN_KEY, 'true');
      toMain();
    }
  }, [activeIndex, toMain]);

  const handleSkip = useCallback(() => {
    storage.set(ONBOARDING_SEEN_KEY, 'true');
    toMain();
  }, [toMain]);

  const isLast = activeIndex === SLIDES.length - 1;
  const accent = SLIDES[activeIndex]?.accentColor ?? '#2b7fff';

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Skip 버튼 */}
      <View
        style={{
          height: 48,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        {!isLast && (
          <Pressable
            onPress={handleSkip}
            hitSlop={12}
          >
            <Text
              style={{ fontSize: 14, fontWeight: '500', color: '#94a3b8', letterSpacing: -0.01 }}
            >
              건너뛰기
            </Text>
          </Pressable>
        )}
      </View>

      {/* 슬라이드 */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        renderItem={({ item }: ListRenderItemInfo<Slide>) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
      />

      {/* 하단 영역 */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 28, gap: 28 }}>
        {/* 페이지 인디케이터 */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <Dot
              key={i}
              index={i}
              activeIndex={activeIndex}
            />
          ))}
        </View>

        {/* 버튼 */}
        <Animated.View style={btnStyle}>
          <Pressable
            onPressIn={() => {
              buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
            }}
            onPress={handleNext}
            style={{
              height: 54,
              borderRadius: 16,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: 'white',
                letterSpacing: -0.02,
              }}
            >
              {isLast ? '무료로 시작하기 🚀' : '다음'}
            </Text>
          </Pressable>
        </Animated.View>

        {isLast && (
          <Text
            style={{
              fontSize: 12,
              color: '#94a3b8',
              textAlign: 'center',
              letterSpacing: -0.01,
              marginTop: -16,
            }}
          >
            무료 플랜 · 언제든 PRO 업그레이드 가능
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
