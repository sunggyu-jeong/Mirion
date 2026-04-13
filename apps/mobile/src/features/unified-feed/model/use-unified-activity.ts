import type { ActivityEvent } from '@entities/unified-activity';
import { mergeActivityEvents } from '@entities/unified-activity';
import type { ChainFilter } from '@entities/whale';
import { useCexTrades } from '@features/cex-trades';
import { useWhaleMovements } from '@features/whale-movements';
import { useMemo } from 'react';

export function useUnifiedActivity(chainFilter: ChainFilter = 'ALL'): {
  data: ActivityEvent[];
  isLoading: boolean;
} {
  const { data: movements, isLoading: movementsLoading } = useWhaleMovements(chainFilter);
  const { data: cexTrades, isLoading: cexLoading } = useCexTrades();

  const data = useMemo(
    () => mergeActivityEvents(movements ?? [], cexTrades ?? []),
    [movements, cexTrades],
  );

  return { data, isLoading: movementsLoading || cexLoading };
}
