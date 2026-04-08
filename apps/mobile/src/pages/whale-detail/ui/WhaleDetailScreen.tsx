import { useSubscriptionStore } from '@entities/subscription';
import { CURATED_WHALES } from '@entities/whale';
import { useWhaleDetail } from '@features/whale-detail';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { WhaleDetailView } from '@widgets/whale-detail-view';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WhaleDetailRoute = RouteProp<{ WhaleDetail: { whaleId: string } }, 'WhaleDetail'>;

function shortenAddress(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export function WhaleDetailScreen() {
  const route = useRoute<WhaleDetailRoute>();
  const { whaleId } = route.params;
  const isPro = useSubscriptionStore(s => s.isPro);
  const { goBack, toSettings } = useAppNavigation();
  const { data } = useWhaleDetail(whaleId);

  const whale = CURATED_WHALES.find(w => w.id === whaleId);

  const handleUpgrade = useCallback(() => {
    toSettings();
  }, [toSettings]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#f8fafc',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft
            size={20}
            color="#0f172b"
            strokeWidth={2}
          />
        </Pressable>

        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: '#0f172b',
                letterSpacing: -0.03,
              }}
            >
              {whale?.name ?? whaleId}
            </Text>
          </View>
          {whale && (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '400',
                color: '#94a3b8',
                letterSpacing: 0,
              }}
            >
              {shortenAddress(whale.address)}
            </Text>
          )}
        </View>

        {whale && (
          <View
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#62748e',
                letterSpacing: -0.01,
              }}
            >
              {whale.tag}
            </Text>
          </View>
        )}
      </View>

      {data ? (
        <WhaleDetailView
          data={data}
          isPro={isPro}
          onUpgrade={handleUpgrade}
        />
      ) : null}
    </SafeAreaView>
  );
}
