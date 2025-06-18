import { useMemo } from 'react';

import { useCreditDelegationContext } from '../CreditDelegationContext';
import { AssetToLend } from '../types';

export const useAssetsToLend = () => {
  const { markets, pools } = useCreditDelegationContext();

  // Aggregate assets by key, including a `name` field on the returned object
  const aggregated = useMemo(() => {
    type Accumulator = Record<string, AssetToLend & { price?: number }>;
    return markets.reduce<Accumulator>((acc, market) => {
      const { asset, product } = market;
      const symbol = asset?.symbol ?? 'default';

      const marketPools = pools.filter((pool) =>
        pool.marketUtilizationDetails?.some(
          (m) => m.marketId.toLowerCase() === market.id.toLowerCase()
        )
      );

      const key = `${symbol}-${product.data}-${product.details}`;
      const existing = acc[key] ?? {
        key,
        symbol,
        asset,
        markets: [] as typeof markets,
        minApy: Infinity,
        maxApy: -Infinity,
        securedBy: `${product.data ?? ''}${product.details ?? ''}`,
        price: undefined,
      };

      const apys = marketPools.map((pool) => Number(pool.totalApy));
      const maxApy = Math.max(existing.maxApy, ...apys);
      const minApy = Math.min(existing.minApy, ...apys);

      acc[key] = {
        ...existing,
        asset,
        markets: [...existing.markets, market],
        minApy: Number.isFinite(minApy) ? minApy : 0,
        maxApy: Number.isFinite(maxApy) ? maxApy : 0,
        securedBy: existing.securedBy,
      };

      return acc;
    }, {} as Record<string, AssetToLend & { price?: number }>);
  }, [markets, pools]);

  // Extract unique coin IDs to fetch rates
  const tokens = useMemo(() => {
    const ids = Object.values(aggregated);
    return Array.from(new Set(ids));
  }, [aggregated]);

  return tokens;
};
