import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { ChevronRight } from 'lucide-react-native';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, View } from 'react-native';

import { BottomSheetHandler, common, gray } from '@/src/shared';
import BottomSheetWrapper from '@/src/shared/ui/BottomSheet';

interface WalletOption {
  id: string;
  name: string;
  logo: any;
}

interface ConnectWalletSheetProps {
  onConnect: (walletId: string) => void;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: { uri: 'https://img.icons8.com/color/48/metamask.png' },
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    logo: { uri: 'https://img.icons8.com/color/48/walletconnect.png' },
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    logo: { uri: 'https://img.icons8.com/color/48/coinbase-wallet.png' },
  },
];

const ConnectWalletSheet = forwardRef<BottomSheetHandler, ConnectWalletSheetProps>(
  ({ onConnect }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      expand: () => sheetRef.current?.expand(),
      collapse: () => sheetRef.current?.collapse(),
      close: () => sheetRef.current?.close(),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
    }));

    const handleWalletPress = useCallback(
      (walletId: string) => {
        onConnect(walletId);
        sheetRef.current?.close();
      },
      [onConnect],
    );

    const renderWalletItem = useCallback(
      ({ item }: { item: WalletOption }) => (
        <TouchableOpacity
          style={styles.walletRow}
          onPress={() => handleWalletPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.walletContent}>
            <View style={styles.logoContainer}>
              <Image
                source={item.logo}
                style={styles.logo}
              />
            </View>
            <Text style={styles.walletName}>{item.name}</Text>
          </View>
          <ChevronRight
            size={18}
            color={gray[400]}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      ),
      [handleWalletPress],
    );

    return (
      <Portal>
        <BottomSheetWrapper
          ref={sheetRef}
          snapPoints={['40%', '50%']}
          isDetached
          bottomInset={Platform.OS === 'ios' ? 34 : 24}
        >
          <View style={styles.container}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>지갑 연결</Text>
              <Text style={styles.subtitle}>계속하려면 연결할 지갑을 선택하세요</Text>
            </View>

            <FlatList
              data={WALLET_OPTIONS}
              keyExtractor={item => item.id}
              renderItem={renderWalletItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </BottomSheetWrapper>
      </Portal>
    );
  },
);

ConnectWalletSheet.displayName = 'ConnectWalletSheet';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 36,
    paddingBottom: 20,
  },
  headerTextContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: gray[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: gray[500],
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
    backgroundColor: common.white,
    borderRadius: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: gray[100],
    ...Platform.select({
      ios: {
        shadowColor: gray[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  walletName: {
    marginLeft: 16,
    fontSize: 17,
    fontWeight: '600',
    color: gray[800],
  },
});

export default ConnectWalletSheet;
