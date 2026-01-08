import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LivePriceCard } from '@/src/widgets/live-price-card';
import { VaultStatusCard } from '@/src/widgets/vault-status-card';

export default function HomePage() {
  const [isStored, setIsStored] = useState(false);

  const mockData = {
    price: '3,245,000',
    balance: '1.25',
    startDate: '2026-01-04',
    unlockDate: '2026-01-06',
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LivePriceCard
          price={mockData.price}
          isStored={isStored}
          onToggle={() => setIsStored(!isStored)}
        />

        {isStored ? (
          <VaultStatusCard
            balance={mockData.balance}
            startDate={mockData.startDate}
            unlockDate={mockData.unlockDate}
          />
        ) : (
          <View style={styles.emptyBox}>
            <Text>자산이 없습니다. 이더리움을 저장해보세요!</Text>
          </View>
        )}

        <View style={styles.footerInfo}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#94A3B8"
          />
          <Text style={styles.footerText}>자산을 저장하면 설정한 기간 동안 출금이 제한됩니다.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    marginTop: 10,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
  },
  emptyBox: {
    marginTop: 20,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
  },
});
