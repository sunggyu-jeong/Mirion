import { Text, View } from 'react-native';
import { formatUnits } from 'viem';
import { useBalance, useConnection } from 'wagmi';

import { useEthPrice } from '@/src/entities/price-tracker';

export const WalletHeader = () => {
  const { address } = useConnection();
  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });
  const { data: price } = useEthPrice();

  const formattedBalance = balance ? formatUnits(balance.value, balance.decimals) : '0';

  const krwValue =
    balance && price
      ? (parseFloat(formattedBalance) * price).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
      : '0';
  return (
    <View className="items-center justify-center py-12 bg-black">
      <View className="absolute top-0 right-4 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
        <Text className="text-gray-400 font-bold text-xs">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}
        </Text>
      </View>

      <Text className="text-white text-4xl font-bold">₩{krwValue}</Text>

      <Text className="text-gray-500 text-lg mt-2 font-medium">
        {parseFloat(formattedBalance).toFixed(4)} ETH
      </Text>
    </View>
  );
};
