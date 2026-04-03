import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';

interface Props {
  visible: boolean;
}

function Dot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ]),
    ).start();

    return () => anim.stopAnimation();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ffffff',
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
        ],
        opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }),
      }}
    />
  );
}

export function LoadingOverlay({ visible }: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={styles.overlay}
        pointerEvents="box-only"
      >
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
