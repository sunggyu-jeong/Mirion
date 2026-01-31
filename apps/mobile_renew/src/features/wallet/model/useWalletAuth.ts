import { isNotEmpty } from '@/src/shared';
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi';

export const useWalletAuth = () => {
  const { connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const { address, isConnected, chainId } = useAccount();
  const connectors = useConnectors();

  const handleConnect = (connectorId?: string) => {
    const target = connectorId ? connectors.find(c => c.id === connectorId) : connectors[0];

    if (isNotEmpty(target)) {
      connect({ connector: target });
    }
  };

  return {
    connect: handleConnect,
    disconnect,
    address,
    isConnected,
    chainId,
    error,
    isPending,
    connectors,
  };
};
