import type { WhaleProfile } from '@entities/whale';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface WhaleDetailHeaderProps {
  whaleId: string;
  whale?: WhaleProfile;
  onBack: () => void;
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export function WhaleDetailHeader({ whaleId, whale, onBack }: WhaleDetailHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 }}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={20} color="#0f172b" strokeWidth={2} />
      </Pressable>

      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172b' }}>
          {whale?.name ?? whaleId}
        </Text>
        {whale && (
          <Text style={{ fontSize: 11, fontWeight: '400', color: '#94a3b8' }}>
            {shortenAddress(whale.address)}
          </Text>
        )}
      </View>

      {whale && (
        <View style={{ backgroundColor: '#f8fafc', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#62748e' }}>{whale.tag}</Text>
        </View>
      )}
    </View>
  );
}
