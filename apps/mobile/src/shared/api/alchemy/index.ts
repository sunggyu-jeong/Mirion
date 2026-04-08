import Config from 'react-native-config';

export type { AlchemyClient } from './client';
export { createAlchemyClient } from './client';
export type {
  AlchemyAssetTransfersResponse,
  AlchemyTokenBalance,
  AlchemyTokenBalancesResponse,
  AlchemyTransferRaw,
} from './types';

import { createAlchemyClient } from './client';

export const alchemyClient = createAlchemyClient({
  apiKey: Config.ALCHEMY_API_KEY ?? '',
  network: Config.ALCHEMY_NETWORK ?? 'eth-mainnet',
});
