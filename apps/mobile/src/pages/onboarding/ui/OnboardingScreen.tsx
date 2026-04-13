import { useAppNavigation } from '@shared/lib/navigation';
import { ONBOARDING_SEEN_KEY, storage } from '@shared/lib/storage';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, type ViewToken } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingDots } from './OnboardingDots';
import { type Slide, SlideItem, SLIDES } from './OnboardingSlides';

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

  const completeOnboarding = useCallback(() => {
    storage.set(ONBOARDING_SEEN_KEY, 'true');
    toMain();
  }, [toMain]);

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  }, [activeIndex, completeOnboarding]);

  const isLast = activeIndex === SLIDES.length - 1;
  const accent = SLIDES[activeIndex]?.accentColor ?? '#2b7fff';
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          height: 48,
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingHorizontal: 20,
        }}
      >
        {!isLast && (
          <Pressable
            onPress={completeOnboarding}
            hitSlop={12}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#94a3b8' }}>건너뛰기</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
      />

      <View style={{ paddingHorizontal: 24, paddingBottom: 28, gap: 28 }}>
        <OnboardingDots activeIndex={activeIndex} />
        <Animated.View style={btnStyle}>
          <Pressable
            onPressIn={() => {
              buttonScale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
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
            <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
              {isLast ? '무료로 시작하기 🚀' : '다음'}
            </Text>
          </Pressable>
        </Animated.View>
        {isLast && (
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: -16 }}>
            무료 플랜 · 언제든 PRO 업그레이드 가능
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
