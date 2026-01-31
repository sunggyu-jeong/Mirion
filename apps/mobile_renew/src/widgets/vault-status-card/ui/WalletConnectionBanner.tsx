import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/shared';

export const WalletConnectionBanner = ({ onConnect }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>지갑을 연결하고 시작하세요</Text>
    <Text style={styles.desc}>
      LockFi의 안전한 타임락 금고를 이용하려면 지갑 연결이 필요합니다.
    </Text>
    <Button
      label="지갑 연결하기"
      onPress={onConnect}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  desc: { fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 20 },
});
