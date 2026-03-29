import { CHAIN } from '@shared/api/contracts';
import Config from 'react-native-config';
import { createPublicClient, http } from 'viem';

const rpcUrl = Config.RPC_URL || undefined;

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(rpcUrl),
});
