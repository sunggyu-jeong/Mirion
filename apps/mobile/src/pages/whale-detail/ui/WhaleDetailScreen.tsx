import { useSubscriptionStore } from '@entities/subscription';
import { CURATED_WHALES } from '@entities/whale';
import { useWhaleDetail } from '@features/whale-detail';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { WhaleDetailHeader, WhaleDetailView } from '@widgets/whale-detail-view';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type WhaleDetailRoute = RouteProp<{ WhaleDetail: { whaleId: string } }, 'WhaleDetail'>;

export function WhaleDetailScreen() {
  const route = useRoute<WhaleDetailRoute>();
  const { whaleId } = route.params;
  const isPro = useSubscriptionStore(s => s.isPro);
  const { goBack, toSettings } = useAppNavigation();
  const { data } = useWhaleDetail(whaleId);

  const whale = CURATED_WHALES.find(w => w.id === whaleId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <WhaleDetailHeader
        whaleId={whaleId}
        whale={whale}
        onBack={goBack}
      />
      {data && (
        <WhaleDetailView
          data={data}
          isPro={isPro}
          onUpgrade={toSettings}
        />
      )}
    </SafeAreaView>
  );
}
