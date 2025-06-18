import { ERC20Service } from '@aave/contract-helpers';
import { useMemo } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import type { TokenDataWithPrice } from '../types';
import useAsyncMemo from './useAsyncMemo';
import { useCoinRate } from './useCoinRate';

export const useTokensData = (tokenIds?: string[]) => {
  const { provider } = useWeb3Context();
  const { getPrice, getCoinId } = useCoinRate();

  // memoize the service so we don't re-instantiate on every render
  const erc20Service = useMemo(
    () => (provider ? new ERC20Service(provider) : undefined),
    [provider]
  );

  const [data, { loading, error, reload }] = useAsyncMemo<TokenDataWithPrice[] | undefined>(
    async () => {
      if (!tokenIds || !provider || !erc20Service) return undefined;

      // 1) fetch USD rates
      const coinIds = tokenIds.map((id) => getCoinId(id));
      const rates = await getPrice(coinIds);
      const ratesMap = Object.fromEntries(
        Object.entries(rates).map(([id, rate]) => [id.toLowerCase(), rate.usd])
      );

      // 2) fetch on-chain data in parallel
      const results = await Promise.allSettled(
        tokenIds.map((tokenId) => erc20Service.getTokenData(tokenId))
      );

      // 3) merge with pricing
      return results.map((res, idx) => {
        if (res.status === 'fulfilled') {
          const info = res.value;
          const price = ratesMap[getCoinId(info.symbol).toLowerCase()]?.toString() ?? '0';
          return {
            ...info,
            priceInUsd: price,
            aToken: false,
            iconSymbol: info.symbol,
          };
        }
        // fallback empty data on failure
        return {
          name: '',
          symbol: '',
          decimals: 18,
          address: tokenIds[idx],
          priceInUsd: '0',
          aToken: false,
          iconSymbol: 'default',
        };
      });
    },
    undefined,
    [tokenIds, erc20Service]
  );

  return { data, loading, error, reload };
};
