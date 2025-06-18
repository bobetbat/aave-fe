import { useQueries, UseQueryResult } from '@tanstack/react-query';
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

interface ILendingOutflowProcessorFactory {
  id: string;
  rpcAddress: string;
  listContract: string;
  creatorListId: string;
}

interface ILendingOutflowProcessor {
  id: string;
  approver: string;
  rpcAddress: string;
  data: string;
  lastLoanRequestId: string;
  lastLoanId: string;
  factory: ILendingOutflowProcessorFactory;
  asset: string;
  list: string;
  timelock: string;
}

interface IPolicy {
  chainId: number;
  graphName: string;
  id: string;
  policyId: string;
  productTitle: string;
  productId: string;
  marketPreview: IMarketPreview[];
  validFrom: string;
  netRate: number;
  marketAPR: number;
  marketAPY: number;
  capitalToken: IToken;
  premiumToken: IToken;
  desiredCoverage: number;
  desiredCoverageInUsd: number;
  totalCapacity: number;
  totalCapacityInUsd: number;
  policyBalance: number;
  policyBalanceInUsd: number;
  capitalTokenRateInUsd: number;
  premiumTokenRateInUsd: number;
  marketRateOracle: string;
  owner: string;
  lendingOutflowProcessorAddress: string;
  lendingOutflowProcessor: ILendingOutflowProcessor;
}
export interface LoanChunk {
  accruedInterest: string;
  adapterAddress: string;
  adapterLoanId: string;
  borrowedAmount: string;
  chainId: number;
  fullLoanId: string;
  id: string;
  index: string;
  lastUpdateTs: string;
  loanId: string;
  paidInterest: string;
  poolCapitalToken: {
    name: string;
    address: string;
  };
  poolLabel: string;
  rate: string;
  repaidPrincipal: string;
  poolId: string;
}

export interface LoansApiData {
  id: string;
  loanRequestId: string;
  fullLoanRequestId: string;
  policyId: string;
  marketId: string;
  borrowedAmount: string;
  feeSetId: string;
  feesRate: string;
  interestCharged: string;
  interestPaid: string;
  principalRepaid: string;
  data: string;
  createdAt: string;
  loanId: string;
  key: string;
  chunks: LoanChunk[];
  graphName: string;
  marketPreview: IMarketPreview[];
  capitalToken: IToken;
  borrowedAmountInUsd: number;
  interestPaidInUsd: number;
  repaidPrincipal: number;
  repaidPrincipalInUsd: number;
  leftToRepay: number;
  leftToRepayInUsd: number;
  totalAccruedInterest: number;
  totalAccruedInterestInUsd: number;
  interestToPay: number;
  interestToPayInUsd: number;
  interestRatePerYear: number;
  capitalTokenRateInUsd: number;
  productId: string;
  policy: IPolicy;
  loanAgreement: string;
  isClosed: boolean;
}

const fetchLoansApi = async (atomicaEndpoint: string): Promise<LoansApiData[]> => {
  const response = await fetch(atomicaEndpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${atomicaEndpoint}`);
  }
  return response.json();
};

export const useLoansApi = (accounts: string[]): UseQueryResult<LoansApiData[]>[] => {
  const { secondaryMarket, chainId } = useRootStore((store) => store.currentMarketData);

  // Create one query config per account
  const queries = useQueries({
    queries: accounts.map((account) => ({
      queryKey: ['loansApi', chainId, account],
      queryFn: () =>
        fetchLoansApi(
          `${secondaryMarket?.atomicaApiUrl}/v2/lending/loans?chainId=${chainId}&account=${account}`
        ),
      enabled: Boolean(secondaryMarket?.atomicaApiUrl && chainId && account), // no fetch if any are missing
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    })),
  });

  return queries;
};
