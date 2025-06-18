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

interface IMarketPreview {
  title: string;
  icons: string;
  id: string;
}

interface ISortedAggregatedPool {
  id: string;
  totalCapacity: string;
  nextAggregatedPoolId: string;
  rate: string;
}

export interface MarketsApiData {
  chainId: number;
  graphName: string;
  id: string;
  marketId: string;
  productTitle: string;
  productId: string;
  marketPreview: IMarketPreview[];
  capitalToken: IToken;
  premiumToken: IToken;
  insuredToken: IToken;
  feeToken: IToken;
  marketDelegateTitle: string;
  marketDelegateLogo: string;
  operatorAddress: string;
  netRate: number;
  minApr: number;
  currentApr: number;
  currentPureApr: number;
  coverMiningAPY: number;
  desiredCover: number;
  actualCover: number;
  actualCoverInUsd: number;
  totalCapacity: number;
  totalCapacityInUsd: number;
  desiredCoverAvailableInUsd: number;
  capitalTokenRateInUsd: number;
  hasCoverMining: boolean;
  sortedAggregatedPools: ISortedAggregatedPool[];
  ownerAddress: string;
}

const fetchMarketsApi = async (atomicaEndpoint: string): Promise<MarketsApiData[]> => {
  const response = await fetch(atomicaEndpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${atomicaEndpoint}`);
  }
  return response.json();
};
export const useMarketsApi = () => {
  // const { atomicaApiUrl, chainId, frontendOperatorAddress } = useConfig();
  const { secondaryMarket: { atomicaApiUrl, frontendOperatorAddress } = {}, chainId } =
    useRootStore((store) => store.currentMarketData);

  const query = useQuery<MarketsApiData[]>({
    queryKey: ['marketsApi', chainId, frontendOperatorAddress],
    queryFn: () =>
      fetchMarketsApi(
        `${atomicaApiUrl}/v2/lending/markets?chainId=${chainId}&frontendOperator=${frontendOperatorAddress}`
      ),
    enabled: Boolean(atomicaApiUrl && chainId && frontendOperatorAddress),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return query.data;
};
