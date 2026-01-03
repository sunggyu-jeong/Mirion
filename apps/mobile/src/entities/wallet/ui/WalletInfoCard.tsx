import { StyleSheet, View } from 'react-native';

import { Card, Label, Value } from '@/src/shared';

interface WalletProps {
  address: string;
  network: string;
}

export const WalletInfoCard = ({ address, network }: WalletProps) => (
  <Card>
    <Label>연결된 주소</Label>
    <View style={styles.addressContainer}>
      <Value style={styles.addressText}>{address}</Value>
    </View>
    <Value>{network}</Value>
  </Card>
);

const styles = StyleSheet.create({
  addressContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  addressText: {
    fontFamily: 'Courier',
  },
});
