import { useConnection, useBalance } from 'wagmi'

export const useWalletInfo = () => {
  const { address, isConnected, chain } = useConnection()
  
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  })

  const formattedBalance = balanceData 
    ? `${balanceData.decimals.toFixed(4)} ${balanceData.symbol}` 
    : '0.00 ETH'

  return {
    address,
    isConnected,
    chainName: chain?.name,
    formattedBalance,
    isBalanceLoading,
  }
}