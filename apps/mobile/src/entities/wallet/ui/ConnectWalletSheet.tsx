import { BottomSheetHandler, common, gray } from '@/src/shared';
import BottomSheetWrapper from '@/src/shared/ui/BottomSheet';
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

interface WalletOption {
  id: string;
  name: string;
  logo: any;
}

interface ConnectWalletSheetProps {
  onConnect: (walletId: string) => void;
}

//TODO: 지갑 아이콘 추가필요
const WALLET_OPTIONS: WalletOption[] = [
  { id: 'metamask', name: 'MetaMask', logo: require('') },
  { id: 'walletconnect', name: 'WalletConnect', logo: require('') },
  { id: 'coinbase', name: 'Coinbase Wallet', logo: require('') },
];

const SHEET_CONFIG = {
  itemHeight: 64,
  visibleItems: 4,
  snapPoints: [200, '45%'],
} as const;

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
          activeOpacity={0.6}
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
        </TouchableOpacity>
      ),
      [handleWalletPress],
    );

    return (
      <BottomSheetWrapper
        ref={sheetRef}
        snapPoints={SHEET_CONFIG.snapPoints}
        isDetached
        bottomInset={24}
      >
        <View style={styles.container}>
          <Text style={styles.title}>지갑 연결</Text>

          <FlatList
            data={WALLET_OPTIONS}
            keyExtractor={item => item.id}
            renderItem={renderWalletItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={WALLET_OPTIONS.length > SHEET_CONFIG.visibleItems}
            style={{ maxHeight: SHEET_CONFIG.itemHeight * SHEET_CONFIG.visibleItems }}
          />
        </View>
      </BottomSheetWrapper>
    );
  },
);

ConnectWalletSheet.displayName = 'ConnectWalletSheet';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'left',
    color: gray[900],
  },
  listContent: {
    paddingBottom: 8,
  },
  walletRow: {
    height: SHEET_CONFIG.itemHeight,
    backgroundColor: gray[50],
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: common.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  walletName: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '500',
    color: gray[800],
  },
});

export default ConnectWalletSheet;
