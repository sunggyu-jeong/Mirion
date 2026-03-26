import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

export type Step = {
  label: string;
  subtitle?: string;
};

type StepIndicatorProps = {
  steps: Step[];
  activeStep: number;
};

function StepBadge({ number, isActive }: { number: number; isActive: boolean }) {
  const scale = useSharedValue(isActive ? 1 : 0.8);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withSpring(0.8, { damping: 12, stiffness: 200 });
    }
  }, [isActive, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive ? '#2b7fff' : '#f1f5f9',
        },
        animStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: isActive ? '#f8fafc' : '#1d293d',
          textAlign: 'center',
          lineHeight: 21,
        }}
      >
        {number}
      </Text>
    </Animated.View>
  );
}

function ConnectorLine() {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(150, withSpring(164, { damping: 20, stiffness: 100 }));
  }, [height]);

  return (
    <View
      style={{
        width: 1,
        height: 40,
        marginLeft: 11.5,
        backgroundColor: '#cad5e2',
      }}
    />
  );
}

export function StepIndicator({ steps, activeStep }: StepIndicatorProps) {
  return (
    <View style={{ gap: 0 }}>
      {steps.map((step, index) => {
        const isActive = index === activeStep;

        return (
          <View key={index}>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', height: 55 }}>
              <View style={{ paddingTop: 4 }}>
                <StepBadge
                  number={index + 1}
                  isActive={isActive}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#0f172b',
                    letterSpacing: 0.48,
                    lineHeight: 24,
                  }}
                >
                  {step.label}
                </Text>
                {isActive && step.subtitle ? (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '400',
                      color: '#62748e',
                      letterSpacing: -0.16,
                      lineHeight: 24,
                      marginTop: 2,
                    }}
                  >
                    {step.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
            {index < steps.length - 1 ? <ConnectorLine /> : null}
          </View>
        );
      })}
    </View>
  );
}
