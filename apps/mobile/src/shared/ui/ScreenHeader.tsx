import { X } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  onClose: () => void;
};

export function ScreenHeader({ onClose }: Props) {
  return (
    <View style={{ paddingHorizontal: 20, height: 56, justifyContent: 'center' }}>
      <Pressable
        onPress={onClose}
        hitSlop={12}
      >
        <X
          size={24}
          color="#0f172b"
        />
      </Pressable>
    </View>
  );
}
