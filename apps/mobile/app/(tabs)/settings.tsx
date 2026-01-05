import { Label } from '@react-navigation/elements';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { WalletInfoCard } from '@/src/entities/wallet/ui';
import { ExploreNetworkButton } from '@/src/features/wallet/ui/ExploreNetworkButton';
import { Card, Value } from '@/src/shared';

export default function SettingPage() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.pageTitle}>설정</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>지갑정보</Text>
        <WalletInfoCard
          address="0x1234567890123456789012345678901234567890"
          network="Base L2 Network"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정보</Text>
        <Card>
          <View style={styles.row}>
            <Label>버전</Label>
            <Value>1.0.0</Value>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Label>네트워크</Label>
            <Value>Base Mainnet</Value>
          </View>
          <ExploreNetworkButton networkName="Base" />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  separator: { height: 1, backgroundColor: '#E5E7EB', width: '100%' },
});
