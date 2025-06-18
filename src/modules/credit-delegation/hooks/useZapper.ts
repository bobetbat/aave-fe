import { useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { createCache } from '../cache';
import { NEXT_PUBLIC_ZAPPER_API_KEY } from '../consts';
import { ZapperBalance } from '../types';

interface ZapperResponse {
  key: string;
  address: string;
  network: string;
  updatedAt: string;
  token: {
    id: string;
    networkId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    coingeckoId: string;
    priceUpdatedAt: string;
    price: number;
    balance: number;
    balanceUSD: number;
    balanceRaw: string;
  };
}

type AllowedChainIDs = 1 | 5 | 137 | 80001 | 42161 | 421613;

const NETWORKS_MAP = {
  1: 'ethereum',
  5: 'ethereum',
  137: 'polygon',
  80001: 'polygon',
  42161: 'arbitrum',
  421613: 'arbitrum',
  11155111: 'ethereum',
};

const INTERVAL = 1000 * 60 * 5;

const cache = createCache<ZapperBalance[]>({ expirationDelay: INTERVAL });

let timeOut: NodeJS.Timeout | undefined;

const Authorization = `Basic ${Buffer.from(`${NEXT_PUBLIC_ZAPPER_API_KEY}:`, 'binary').toString(
  'base64'
)}`;

const requestInfo = (method: string) => ({
  method,
  headers: {
    accept: '*/*',
    Authorization,
  },
});

const parseZapperBalance = (balances?: ZapperResponse[]): ZapperBalance[] | undefined => {
  return balances?.map(({ token }) => {
    return {
      name: token.name,
      symbol: token.symbol,
      address: token.address,
      decimals: token.decimals,
      coingeckoId: token.coingeckoId,
      priceUSD: token.price,
      balanceNormalized: token.balance,
      balanceUSD: token.balanceUSD,
      balanceRaw: token.balanceRaw,
    };
  });
};

const getBalances = async (currentAccount: string, chainId: AllowedChainIDs) => {
  // Testing purposes only
  const networkName = NETWORKS_MAP[chainId];

  const response = await fetch(
    `https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D=${currentAccount}&networks%5B%5D=${networkName}`,
    requestInfo('POST')
  );

  const { jobId } = await response.json();
  let jobStatus;

  do {
    const jobStatusResponse = await fetch(
      `https://api.zapper.xyz/v2/balances/job-status?jobId=${jobId}`,
      requestInfo('GET')
    );
    const { status } = await jobStatusResponse.json();
    jobStatus = status;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (jobStatus !== 'completed');
  {
    const balancesResponse = await fetch(
      `https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D=${currentAccount}&networks%5B%5D=${networkName}`,
      requestInfo('GET')
    );
    const balances = await balancesResponse.json();

    const zapperBalances = parseZapperBalance(Object.values(balances)[0] as ZapperResponse[]) || [];
    cache.set(currentAccount.toLowerCase(), zapperBalances);

    return zapperBalances;
  }
};

const refreshBalance = async (currentAccount: string, chainId: AllowedChainIDs) => {
  if (timeOut !== undefined) clearInterval(timeOut);

  await getBalances(currentAccount, chainId);

  timeOut = setInterval(() => getBalances(currentAccount, chainId), INTERVAL);
};

export const useZapper = () => {
  const { currentAccount, chainId } = useWeb3Context();
  const [balances, setBalances] = useState<ZapperBalance[]>(
    currentAccount ? cache.get(currentAccount.toLowerCase()) ?? [] : []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!currentAccount || !chainId) return;

    const currentBalances = cache.get(currentAccount.toLowerCase());

    setBalances(currentBalances ?? []);

    setLoading(true);

    refreshBalance(currentAccount, chainId as AllowedChainIDs).then(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      if (timeOut !== undefined) clearInterval(timeOut);
    };
  }, [currentAccount, chainId]);

  useEffect(() => {
    if (!currentAccount) return;

    const unsubscribe = cache.subscribe(currentAccount.toLowerCase(), setBalances);

    return unsubscribe;
  }, [currentAccount]);

  return { balances, loading };
};
