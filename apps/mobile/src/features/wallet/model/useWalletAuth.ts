import { isNotEmpty } from '@/src/shared';
import { useConnect, useDisconnect, useConnection, useConnectors } from 'wagmi'

export const useWalletAuth = () => {
  const { mutate: connectMutation, error, isPending } = useConnect();
  const { mutate: disconnectMutation } = useDisconnect();
  const { address, isConnected, chainId } = useConnection();
  const connectors = useConnectors()

  const handleConnect = (connectorId?: string) => {
    const targetConnectors = connectorId ? connectors.find((c) => c.id === connectorId) : connectors[0]
    if(isNotEmpty(targetConnectors)) {
      connectMutation({ connector: targetConnectors })
    }
  }

  return {
    connect: handleConnect,
    error,
    isPending,
    disconnect: disconnectMutation,
    address,
    isConnected,
    chainId
  }
}