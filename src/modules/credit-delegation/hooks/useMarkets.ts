import { loader } from 'graphql.macro';
import { useMemo } from 'react';

import { AtomicaBorrowMarket } from '../types';
import { useSubgraph } from './useSubgraph';

const RWA_MARKETS_QUERY = loader('../queries/rwa-markets.gql');

export const useRwaMarkets = (insuredToken?: string) => {
  const {
    loading,
    error,
    data: marketsData,
  } = useSubgraph<{
    markets: AtomicaBorrowMarket[];
  }>(RWA_MARKETS_QUERY, {
    skip: !insuredToken,
    variables: {
      insuredToken: insuredToken,
    },
  });

  const market = useMemo(() => {
    if (!marketsData || !marketsData.markets || marketsData.markets.length == 0) return undefined;
    return marketsData.markets.reduce((max, obj) => {
      return Number(obj.marketId) > Number(max.marketId) ? obj : max;
    });
  }, [marketsData]);

  return {
    loading: loading,
    error: error,
    data: market,
  };
};
