import { Label } from '@react-navigation/elements';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccount, useDisconnect } from 'wagmi';

import { WalletInfoCard } from '@/src/entities/wallet/ui';
import ConnectWalletSheet from '@/src/entities/wallet/ui/ConnectWalletSheet';
import { useWalletAuth } from '@/src/features/wallet';
import { ExploreNetworkButton } from '@/src/features/wallet/ui/ExploreNetworkButton';
import { Button, Card, Value } from '@/src/shared';
import { useRef } from 'react';

export default function SettingPage() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useWalletAuth();
  const sheetRef = useRef<any>(null);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.pageTitle}>설정</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지갑 정보</Text>
          {isConnected ? (
            <>
              <WalletInfoCard
                address={address ?? ''}
                network={chain?.name || 'Base L2 Network'}
              />
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={() => disconnect()}
              >
                <Text style={styles.disconnectText}>지갑 연결 해제</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>연결된 지갑이 없습니다.</Text>
              <Button
                label="지갑 연결하기"
                style={{ marginTop: 12, width: '100%' }}
                onPress={() => sheetRef.current?.expand()}
              />
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <Card>
            <View style={styles.row}>
              <Label style={{ color: '#6B7280' }}>버전</Label>
              <Value>1.0.0</Value>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <Label style={{ color: '#6B7280' }}>네트워크</Label>
              <Value>{isConnected ? chain?.name : '미연결'}</Value>
            </View>
            {isConnected && chain?.name === 'Base' && <ExploreNetworkButton networkName="Base" />}
          </Card>
        </View>
      </ScrollView>
      <ConnectWalletSheet
        ref={sheetRef}
        onConnect={id => connect(id)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24, color: '#111827' },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    alignItems: 'center',
  },
  separator: { height: 1, backgroundColor: '#F3F4F6', width: '100%' },

  disconnectButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
  },
  disconnectText: { color: '#F43F5E', fontWeight: '600', fontSize: 14 },

  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
