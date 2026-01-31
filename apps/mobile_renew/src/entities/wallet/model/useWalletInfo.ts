import { useAccount, useBalance } from 'wagmi';

export const useWalletInfo = () => {
  const { address, isConnected, chain } = useAccount();
  
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  const formattedBalance = balanceData 
    ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` 
    : '0.00 ETH';

  return {
    address,
    isConnected,
    chainName: chain?.name,
    formattedBalance,
    isBalanceLoading,
    nativeBalance: balanceData
  };
};