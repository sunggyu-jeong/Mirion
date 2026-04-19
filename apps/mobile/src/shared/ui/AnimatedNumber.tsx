import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type AnimatedNumberProps = {
  value: string;
  fontSize?: number;
  fontWeight?: '400' | '500' | '600' | '700' | '800' | 'bold';
  color?: string;
  letterSpacing?: number;
};

const DIGIT_HEIGHT_RATIO = 1.4;

function SingleDigit({
  digit,
  fontSize,
  fontWeight,
  color,
  letterSpacing,
}: {
  digit: string;
  fontSize: number;
  fontWeight: AnimatedNumberProps['fontWeight'];
  color: string;
  letterSpacing: number;
}) {
  const digitHeight = fontSize * DIGIT_HEIGHT_RATIO;
  const isNumeric = /\d/.test(digit);
  const digitIndex = isNumeric ? parseInt(digit, 10) : 0;
  const translateY = useSharedValue(isNumeric ? -digitIndex * digitHeight : 0);

  useEffect(() => {
    if (isNumeric) {
      translateY.value = withSpring(-digitIndex * digitHeight, {
        damping: 14,
        stiffness: 120,
      });
    }
  }, [digitIndex, digitHeight, isNumeric, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const textStyle = {
    fontSize,
    fontWeight,
    color,
    letterSpacing,
    lineHeight: digitHeight,
    height: digitHeight,
  };

  if (!isNumeric) {
    return <Animated.Text style={textStyle}>{digit}</Animated.Text>;
  }

  return (
    <View style={{ height: digitHeight, overflow: 'hidden' }}>
      <Animated.View style={animatedStyle}>
        {Array.from({ length: 10 }, (_, i) => (
          <Animated.Text
            key={i}
            style={textStyle}
          >
            {i}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
}

export function AnimatedNumber({
  value,
  fontSize = 24,
  fontWeight = '700',
  color = '#0f172b',
  letterSpacing = -0.216,
}: AnimatedNumberProps) {
  const digits = value.split('');

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <SingleDigit
          key={index}
          digit={digit}
          fontSize={fontSize}
          fontWeight={fontWeight}
          color={color}
          letterSpacing={letterSpacing}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});
