import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';

interface IToken {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  fallbackRate: number;
  rateConfig: string;
}

export interface PoolApiData {
  chainId: string;
  id: string;
  poolType: string;
  poolLabel: string;
  notificationUrl: string;
  capitalToken: IToken;
  nominatedToken: IToken;
  network: string;
  version: string;
  rpcAddress: string;
  poolTokenDecimals: number;
  isPoolWithExternalCapital: boolean;
  capitalTokenRate: number;
  poolTokenToCapitalTokenRate: string;
  capitalRequirement: string;
  baseApy: string;
  totalApy: string;
  utilization: string;
  capacity: string;
  capacityInUsd: string;
  levels: number[];
  marketUtilizationDetails: {
    marketId: string;
    utilization: string;
  }[];
  withdrawDelay: string;
  data: string;
  details: string;
}

const fetchPoolsApi = async (atomicaEndpoint: string) => {
  const response = await fetch(atomicaEndpoint);

  if (response.ok) {
    return (await response.json()) as PoolApiData[];
  }

  return [];
};

export const usePoolsApi = () => {
  // const { atomicaApiUrl } = useConfig();
  const { secondaryMarket: { atomicaApiUrl } = {} } = useRootStore(
    (store) => store.currentMarketData
  );

  const query = useQuery({
    queryKey: ['poolsApi', atomicaApiUrl],
    queryFn: () => fetchPoolsApi(`${atomicaApiUrl}/v2/pool/list`),
    enabled: !!atomicaApiUrl,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return query;
};
