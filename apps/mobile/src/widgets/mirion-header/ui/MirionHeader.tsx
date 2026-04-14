import { StreakCard } from '@widgets/streak-card';
import { Bell } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MirionHeaderProps {
  scrollY: SharedValue<number>;
  streakCount: number;
  onNotificationPress?: () => void;
}

export function MirionHeader({ scrollY, streakCount, onNotificationPress }: MirionHeaderProps) {
  const insets = useSafeAreaInsets();
  const [streakVisible, setStreakVisible] = useState(false);

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollY.value,
      [0, 60],
      ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)'],
    ),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 80], [0, 1], 'clamp'),
  }));

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            paddingTop: insets.top,
          },
          backdropStyle,
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 52,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#0f172b',
              letterSpacing: -0.5,
            }}
          >
            미리온
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              onPress={() => setStreakVisible(true)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: pressed ? '#fef3c7' : streakCount > 0 ? '#fffbeb' : 'transparent',
              })}
            >
              <Text style={{ fontSize: 16 }}>🔥</Text>
              {streakCount > 0 && (
                <Text
                  style={{ fontSize: 13, fontWeight: '700', color: '#f97316', letterSpacing: -0.3 }}
                >
                  {streakCount}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={onNotificationPress}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: pressed ? '#f1f5f9' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Bell
                size={22}
                color="#0f172b"
                strokeWidth={1.8}
              />
            </Pressable>
          </View>
        </View>

        <Animated.View style={[{ height: 0.5, backgroundColor: '#e8edf2' }, borderStyle]} />
      </Animated.View>

      <Modal
        visible={streakVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setStreakVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 8,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: '800', color: '#0f172b', letterSpacing: -0.5 }}
            >
              출석 스트릭
            </Text>
            <Pressable
              onPress={() => setStreakVisible(false)}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: pressed ? '#f1f5f9' : '#f8fafc',
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>닫기</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <StreakCard count={streakCount} />
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 12 }}>
            {[
              { days: 7, label: '7일', emoji: '🌟' },
              { days: 14, label: '14일', emoji: '🔥' },
              { days: 30, label: '30일', emoji: '💎' },
              { days: 60, label: '60일', emoji: '👑' },
              { days: 100, label: '100일', emoji: '🏆' },
            ].map(milestone => {
              const reached = streakCount >= milestone.days;
              return (
                <View
                  key={milestone.days}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: reached ? 1 : 0.35,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{milestone.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#0f172b',
                        letterSpacing: -0.2,
                      }}
                    >
                      {milestone.label} 달성
                    </Text>
                  </View>
                  {reached && (
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#22c55e' }}>완료</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}
