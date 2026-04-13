import { AnimatedNumber } from '@shared/ui/AnimatedNumber';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const MILESTONES = [0, 7, 14, 30, 60, 100] as const;
const BAR_SPRING = { stiffness: 120, damping: 16 } as const;

function getMilestoneRange(count: number): { prev: number; next: number } {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (count >= MILESTONES[i]!) {
      const prev = MILESTONES[i]!;
      const next = MILESTONES[i + 1] ?? MILESTONES[MILESTONES.length - 1]!;
      return { prev, next: next === prev ? prev + 1 : next };
    }
  }
  return { prev: 0, next: 7 };
}

function computeProgress(count: number): number {
  const { prev, next } = getMilestoneRange(count);
  if (next === prev) {
    return 1;
  }
  return Math.min((count - prev) / (next - prev), 1);
}

function flameTint(count: number): { bg: string; bar: string; text: string } {
  if (count >= 30) {
    return { bg: '#fff1f2', bar: '#fb2c36', text: '#fb2c36' };
  }
  if (count >= 14) {
    return { bg: '#fff7ed', bar: '#f97316', text: '#f97316' };
  }
  if (count >= 7) {
    return { bg: '#fefce8', bar: '#eab308', text: '#eab308' };
  }
  return { bg: '#f0fdf4', bar: '#22c55e', text: '#22c55e' };
}

interface ProgressBarProps {
  progress: number;
  color: string;
}

function ProgressBar({ progress, color }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, BAR_SPRING);
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <View
      style={{
        height: 7,
        borderRadius: 4,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            borderRadius: 4,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

interface StreakCardProps {
  count: number;
}

export function StreakCard({ count }: StreakCardProps) {
  const tint = flameTint(count);
  const progress = computeProgress(count);
  const { next } = getMilestoneRange(count);
  const remaining = next - count;

  return (
    <Animated.View
      entering={FadeInDown.delay(80).springify().stiffness(400).damping(30)}
      style={{
        backgroundColor: tint.bg,
        borderRadius: 20,
        padding: 18,
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 22 }}>🔥</Text>
          <View style={{ gap: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
              <AnimatedNumber
                value={String(count)}
                fontSize={22}
                fontWeight="800"
                color={tint.text}
                letterSpacing={-0.5}
              />
              <Text
                style={{ fontSize: 14, fontWeight: '600', color: tint.text, letterSpacing: -0.2 }}
              >
                일 연속
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '400' }}>출석 스트릭</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#ffffff60',
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: tint.text }}>{next}일 목표</Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <ProgressBar
          progress={progress}
          color={tint.bar}
        />
        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '400' }}>
          {remaining > 0 ? `목표까지 ${remaining}일 남았어요` : '목표 달성! 🎉'}
        </Text>
      </View>
    </Animated.View>
  );
}
