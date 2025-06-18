/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalize, WEI_DECIMALS } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { loader } from 'graphql.macro';
import { useCallback, useMemo } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { ClientName } from '../apollo';
import {
  AtomicaBorrowMarket,
  AtomicaDelegationPool,
  AtomicaSubgraphMarket,
  AtomicaSubgraphPolicy,
  AtomicaSubgraphPool,
  // PoolBalances,
} from '../types';
import useAsyncMemo from './useAsyncMemo';
import { LendingTokenInfo, useLendingTokensData } from './useLendingTokenData';
import { useLoans } from './useLoans';
import { useMarketsApi } from './useMarketsApi';
import { useMyPoolsApi } from './useMyPoolsApi';
import { usePoolsApi } from './usePoolsApi';
import { usePoolsSheet } from './usePoolSheetConfig';
import { useRiskPool } from './useRiskPool';
import { useSubgraph } from './useSubgraph';
import { useTokensData } from './useTokensData';
import { useUserVaults } from './useUserVaults';

const POLICIES_QUERY = loader('../queries/policies.gql');
const MARKETS_QUERY = loader('../queries/markets.gql');

const POOLS_QUERY = loader('../queries/pools.gql');

export const usePoolsAndMarkets = () => {
  // const { productIds, poolOperatorIds, marketIds } = useConfig();
  const {
    productIds = [],
    poolOperatorIds = [],
    marketIds = [],
  } = useRootStore((store) => store.currentMarketData.secondaryMarket) ?? {};
  const { currentAccount } = useWeb3Context();

  const { data: poolsList, refetch: refetchPoolsApi } = usePoolsApi();
  const { data: myPoolsList, refetch: refetchMyPoolsApi } = useMyPoolsApi(currentAccount);
  const marketsList = useMarketsApi();
  const configPoolsSheetData = usePoolsSheet();

  const { loading: loadingVaults, vaults, refetch: refetchVaults } = useUserVaults();

  const { getLendingTokenAddress } = useRiskPool();

  const {
    loading: policiesLoading,
    error: policiesError,
    data: policiesData,
    sync: policiesSync,
  } = useSubgraph<{
    policies: AtomicaSubgraphPolicy[];
  }>(POLICIES_QUERY, {
    variables: {
      productIds: productIds,
      marketIds: marketIds,
    },
    skip: productIds.length === 0,
  });

  const filteredMyPolicies = useMemo(
    () => policiesData?.policies.filter((policy) => policy.owner === currentAccount) ?? [],
    [policiesData?.policies, currentAccount]
  );

  const {
    loading: marketsLoading,
    error: marketsError,
    data: marketsData,
    sync: marketsSync,
  } = useSubgraph<{
    markets: AtomicaSubgraphMarket[];
  }>(MARKETS_QUERY, {
    variables: {
      productIds: productIds,
    },
    skip: productIds.length === 0,
  });

  const filteredMarkets = useMemo(
    () => marketsData?.markets?.filter((market) => marketIds.includes(market.marketId)),
    [marketsData?.markets, marketIds]
  );

  const {
    loading: poolsLoading,
    error: poolsError,
    data: poolsData,
    sync: poolsSync,
  } = useSubgraph<{
    pools: AtomicaSubgraphPool[];
  }>(POOLS_QUERY, {
    variables: {
      operatorIds: poolOperatorIds,
    },
    context: {
      clientName: ClientName.Pools,
    },
    skip: poolOperatorIds.length === 0,
  });

  const filteredPools = useMemo(() => {
    // Check if poolsData?.pools and filteredMarkets exist
    if (!poolsData?.pools || !filteredMarkets) return [];
    // Extract market IDs from filteredMarkets for comparison
    const filteredMarketIds = filteredMarkets.map((market) => market.id.toLowerCase());

    // Merge pool data and filter based on marketId
    const filtered = poolsData.pools
      .map((pool) => {
        // Find corresponding poolApiData
        const poolApiData = poolsList?.find(
          (data) => data.id.toLowerCase() === pool.id.toLowerCase()
        );
        // Find myPool data
        const myPool = myPoolsList?.find((myPool) => pool.id === myPool.poolId);
        // Merge poolApiData into the pool if everything is available
        return {
          ...pool,
          ...(poolApiData || {}),
          ...(myPool || {}), // Safely merge myPool only if it exists
        };
      })
      .filter((mergedPool) => {
        // Filter out null pools and those without marketUtilizationDetails
        if (!mergedPool || !mergedPool.marketUtilizationDetails) return false;

        // Check if any of the marketIds in marketUtilizationDetails matches a marketId in filteredMarkets
        const hasMatchingMarket = mergedPool.marketUtilizationDetails.some((market) =>
          filteredMarketIds.includes(market.marketId.toLowerCase())
        );

        // Return true if a matching market is found
        return hasMatchingMarket;
      });
    return filtered;
  }, [poolsData, filteredMarkets, poolsList, myPoolsList]);

  const [lendingTokenAddresses, { loading: loadingLendingTokenAddresses }] = useAsyncMemo<
    { poolId: `0x${string}`; lendingTokenAddress: `0x${string}`; operatorFee: string }[]
  >(
    async () => {
      if (!filteredPools) return [];

      const results = await Promise.all(
        filteredPools.map(async (pool) => {
          try {
            const lendingTokenAddress = await getLendingTokenAddress(pool.id as `0x${string}`);
            return {
              ...lendingTokenAddress,
              operatorFee: pool.operatorFee,
            };
          } catch (e) {
            console.error(`Error fetching lending token for pool ${pool.id}`, e);
            return {
              poolId: pool.id as `0x${string}`,
              lendingTokenAddress: '' as `0x${string}`,
              operatorFee: pool.operatorFee,
            };
          }
        })
      );

      return results;
    },
    [],
    [filteredPools]
  );

  const { lendingTokensInfo, forceReload: refetchLendingTokenData } = useLendingTokensData({
    poolData: lendingTokenAddresses,
  });

  const marketTokensIds = useMemo(
    () =>
      filteredMarkets &&
      Array.from(
        new Set([
          ...(filteredMarkets.map((market) => market.capitalToken) ?? []),
          // ...(filteredMarkets.map((market) => market.premiumToken) ?? []),
        ])
      ),
    [filteredMarkets]
  );

  const { data: marketTokens, loading: loadingMarketTokens } = useTokensData(marketTokensIds);

  const pools: AtomicaDelegationPool[] = useMemo(() => {
    if (marketsLoading || poolsLoading || loadingLendingTokenAddresses || loadingVaults) {
      return [];
    }

    return (filteredPools ?? []).map((pool: any) => {
      const lendingTokenInfo = lendingTokensInfo.find(
        (pair: LendingTokenInfo) => pair.poolId === pool.id
      );
      const vault = vaults?.find(
        (vault) => vault.atomicaPool.toLowerCase() === pool.id.toLowerCase()
      );
      const underlyingAsset = pool?.capitalToken?.address ?? '';

      const atomicaAsset = pool?.capitalToken?.address ?? '';

      const status = configPoolsSheetData?.[pool.id.toLowerCase()]?.status;

      return {
        lendingTokenInfo: lendingTokenInfo ?? null,
        symbol: pool?.capitalToken?.symbol ?? '',
        iconSymbol: pool?.capitalToken?.symbol ?? '',
        name: pool.name,
        operator: pool.operator,
        owner: pool.owner,
        markets: pool.marketPreviews,
        underlyingAsset,
        atomicaAsset,
        isActive: true,
        vault,
        operatorFee: normalize(pool.operatorFee, 18), // todo fee tokendecimal
        capacityFormatted: normalize(pool?.capacity, pool?.capitalToken.decimals),
        capitalRequirementFormatted: normalize(
          pool?.capitalRequirement,
          pool?.capitalToken.decimals
        ),
        status,
        data: pool.data,
        details: pool.details,
        ...pool,
      };
    });
  }, [
    vaults,
    loadingVaults,
    configPoolsSheetData,
    filteredPools,
    lendingTokensInfo,
    loadingLendingTokenAddresses,
    marketsLoading,
    poolsLoading,
    poolsList,
    myPoolsList,
  ]);

  const markets: AtomicaBorrowMarket[] = useMemo(() => {
    return (filteredMarkets ?? []).map((market: AtomicaSubgraphMarket) => {
      const connectedPools = pools.filter((pool) => pool.markets.find((m) => m.id === market.id));

      const marketApiData = marketsList?.find(
        (data) => data.id.toLowerCase() === market.id.toLowerCase()
      );

      const availableBorrows = connectedPools.reduce((sum, pool) => {
        const capacityFormatted = parseFloat(pool.capacityFormatted);
        return sum + (isNaN(capacityFormatted) ? 0 : capacityFormatted);
      }, 0);

      const availableBorrowsInUSD = connectedPools.reduce((sum, pool) => {
        const capacityInUsd = Number(pool.capacityInUsd);
        return sum + (isNaN(capacityInUsd) ? 0 : capacityInUsd);
      }, 0);
      // the actual percent
      const apr = Number(marketApiData?.currentApr ?? 0) / 100;

      const rawTotalSupply = connectedPools.reduce((sum, pool) => {
        // pull out the raw string/number (or default to "0")
        const assets = pool.lendingTokenInfo?.totalAssets ?? 0;
        // wrap in BigNumber and add
        return sum.plus(assets);
      }, new BigNumber(0));

      const rawTotalBorrowed = connectedPools.reduce((sum, pool) => {
        const borrowed = pool.lendingTokenInfo?.totalBorrowedPrincipal ?? 0;
        return sum.plus(new BigNumber(borrowed));
      }, new BigNumber(0));

      const totalSupply = normalize(
        rawTotalSupply,
        marketApiData?.capitalToken?.decimals ?? WEI_DECIMALS
      );
      const totalBorrowed = normalize(
        rawTotalBorrowed,
        marketApiData?.capitalToken?.decimals ?? WEI_DECIMALS
      );

      return {
        id: market.id,
        marketId: market.marketId,
        symbol: marketApiData?.capitalToken?.symbol ?? '',
        iconSymbol: marketApiData?.capitalToken?.symbol ?? '',
        title: market.title,
        isActive: true,
        detailsAddress: '',
        totalBorrows: '0.0',
        availableBorrows: String(availableBorrows),
        availableBorrowsInUSD: String(availableBorrowsInUSD),
        stableBorrowRate: '0.0',
        variableBorrowRate: '0.0',
        borrowCap: marketApiData?.capitalToken
          ? normalize(market.desiredCover, marketApiData?.capitalToken.decimals)
          : '0.0',
        product: market.product,
        asset: marketApiData?.capitalToken, // todo: mb implement asset from reserves(aave store structure)
        allowListId: market.policyBuyerAllowListId,
        details: market.details,
        apr,
        outflowProcessor: market.outflowProcessor,
        ...marketApiData,
        supplyAPY: connectedPools[0]?.totalApy, // 1pool per 1market
        totalDebt: totalBorrowed,
        totalDebtUSD: '0',
        totalLiquidity: String(Number(totalSupply) + availableBorrows),
        totalLiquidityUSD: String(Number(0) + availableBorrowsInUSD), //todo: calc usd price
      } as AtomicaBorrowMarket;
    });
  }, [pools, marketsList, filteredMarkets]);

  const { loading: loansLoading, loans, refetchLoans } = useLoans(policiesData?.policies, markets);
  const userLoans = useMemo(
    () => loans.filter((loan) => loan.policy?.owner === currentAccount),
    [currentAccount, loans]
  );

  const refetchAll = useCallback(
    async (blockNumber?: number) => {
      await Promise.all([
        policiesSync(blockNumber),
        poolsSync(blockNumber),
        marketsSync(blockNumber),
        refetchLoans(blockNumber),
        refetchLendingTokenData(),
        refetchMyPoolsApi(),
        refetchVaults(blockNumber),
        refetchPoolsApi(),
      ]);
    },
    [
      refetchPoolsApi,
      refetchMyPoolsApi,
      policiesSync,
      poolsSync,
      marketsSync,
      refetchLoans,
      refetchLendingTokenData,
      refetchVaults,
    ]
  );

  return {
    marketTokens,
    pools,
    markets,
    loans,
    userLoans,
    myPolicies: filteredMyPolicies,
    policies: policiesData?.policies,
    error: policiesError || poolsError || marketsError,
    loading:
      policiesLoading ||
      poolsLoading ||
      marketsLoading ||
      loadingMarketTokens ||
      loansLoading ||
      loadingVaults,
    refetchLoans,
    refetchVaults,
    refetchAll,
  };
};
