import { workerGet } from '@shared/api/worker';

import type { Chain, WhaleMetadata } from '../model/whale.types';

interface WhaleDTO {
  id: string;
  name: string;
  address: string;
  tag: string;
  chain: Chain;
  isLocked: boolean;
}

export async function fetchWhales(): Promise<WhaleMetadata[]> {
  return workerGet<WhaleDTO[]>('/api/whales');
}
