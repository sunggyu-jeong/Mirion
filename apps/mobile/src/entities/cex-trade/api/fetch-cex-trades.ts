import { workerGet } from '@shared/api/worker';

import type { CexTrade } from '../model/cex-trade';

export async function fetchCexTrades(): Promise<CexTrade[]> {
  return workerGet<CexTrade[]>('/api/cex-trades');
}
