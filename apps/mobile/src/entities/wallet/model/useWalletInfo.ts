import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export const useWalletInfo = () => {
  const { address, isConnected, chain } = useAccount();

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  const formattedBalance = balanceData
    ? `${Number(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
    : '0.0000 ETH';

  return {
    address,
    isConnected,
    chainName: chain?.name,
    formattedBalance,
    isBalanceLoading,
  };
};
