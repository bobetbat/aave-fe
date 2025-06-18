import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';

export interface MyPoolApiData {
  chainId: string;
  poolId: string;
  balanceInUsd: string;
  balance: string;
  poolStats: {
    share: number;
    tokenBalance: number;
    balance: number;
  };
}

const fetchMyPoolsApi = async (atomicaEndpoint: string) => {
  const response = await fetch(atomicaEndpoint);

  if (response.ok) {
    return (await response.json()) as MyPoolApiData[];
  }

  return [];
};

export const useMyPoolsApi = (account: string) => {
  // const { atomicaApiUrl } = useConfig();
  const { secondaryMarket: { atomicaApiUrl } = {} } = useRootStore(
    (store) => store.currentMarketData
  );

  const query = useQuery({
    queryKey: ['myPoolsApi', atomicaApiUrl, account],
    queryFn: () => fetchMyPoolsApi(`${atomicaApiUrl}/v2/pool/list/${account}`),
    enabled: !!atomicaApiUrl && !!account,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    // skip: !!atomicaApiUrl || !!account
  });

  return query;
};
