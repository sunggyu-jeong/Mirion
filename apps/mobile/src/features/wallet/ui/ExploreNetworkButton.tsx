import { Alert, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';
interface Props {
  networkName: 'Base';
}

export const ExploreNetworkButton = ({ networkName }: Props) => {
  const EXPLORER_URLS = {
    Base: 'https://basescan.org',
  };

  const handlePress = async () => {
    const url = EXPLORER_URLS[networkName];

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`연결할 수 없는 URL입니다: ${url}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.button}
    >
      <Text style={styles.text}>{networkName} 네트워크 알아보기</Text>
      <Text style={styles.arrow}>〉</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: { fontSize: 14, color: '#6B7280' },
  arrow: { fontSize: 14, color: '#9CA3AF' },
});
