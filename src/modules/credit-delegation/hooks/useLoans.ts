import { BigNumber } from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';
import { loader } from 'graphql.macro';
import { useCallback, useMemo } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import {
  AtomicaBorrowMarket,
  AtomicaLoan,
  AtomicaSubgraphLoanRequest,
  AtomicaSubgraphPolicy,
} from '../types';
import { getRequestStatus } from '../utils';
import { useLoansApi } from './useLoansApi';
import { useSubgraph } from './useSubgraph';

const LOANS_QUERY = loader('../queries/loan-requests.gql');

export const useLoans = (
  policies?: AtomicaSubgraphPolicy[],
  markets: AtomicaBorrowMarket[] = []
) => {
  const { currentAccount } = useWeb3Context();

  const accounts = useMemo(() => policies?.map((policy) => policy.owner), [policies]);
  const policyIds = useMemo(() => policies?.map((policy) => policy.policyId), [policies]);
  const results = useLoansApi([...new Set(accounts ?? [])]);

  const { loading, error, data, sync } = useSubgraph<{
    loanRequests: AtomicaSubgraphLoanRequest[];
  }>(LOANS_QUERY, {
    skip: !policies?.length || !currentAccount,
    variables: {
      policyIds: policyIds ?? [],
      recipient: '',
    },
  });

  // const tokenIds = useMemo(
  //   () => policies?.map((policy) => policy.market.capitalToken) ?? ([] as string[]),
  //   [policies]
  // );

  const loans: AtomicaLoan[] = useMemo(() => {
    const filteredResults = results.flatMap((result) => result.data ?? []);
    const requests = (data?.loanRequests ?? []).map((request) => {
      const policy = policies?.find((policy) => policy.policyId === request.policyId);

      const market = markets.find(
        (market) => market.marketId.toLowerCase() === policy?.marketId.toLowerCase()
      );
      const filteredLoans = filteredResults.filter(
        (item) =>
          item &&
          item.loanRequestId === request.id.split('-')[1] &&
          request.policyId === item.policyId
      );
      const loan = filteredLoans[0] ?? undefined;

      return {
        ...request,
        market: market,
        apiLoan: loan,
        policy: policy,
        status: getRequestStatus(request?.status ?? 0),
        borrowedAmountFormatted: loan
          ? formatUnits(loan.borrowedAmount, market?.asset?.decimals)
          : '0',
        leftToRepayFormatted: formatUnits(
          loan ? new BigNumber(loan.leftToRepay).toFixed(0) : request.amount,
          market?.asset?.decimals
        ),
        repaidPrincipalFormatted: loan
          ? formatUnits(new BigNumber(loan.repaidPrincipal).toFixed(0), market?.asset?.decimals)
          : '0',
        totalAccruedInterestFormatted: loan
          ? formatUnits(
              new BigNumber(loan.totalAccruedInterest).toFixed(0),
              market?.asset?.decimals
            )
          : '0',
        interestToPayFormatted: loan
          ? formatUnits(new BigNumber(loan.interestToPay).toFixed(0), market?.asset?.decimals)
          : '0',
        interestPaidFormatted: loan
          ? formatUnits(new BigNumber(loan.interestPaid).toFixed(0), market?.asset?.decimals)
          : '0',
      };
    });

    return [...requests].filter((loan) => loan !== undefined);
  }, [results, data?.loanRequests, markets]);

  const refetchLoans = useCallback(
    async (blockNumber?: number) => {
      await Promise.all([sync(blockNumber)]);
    },
    [sync]
  );

  return {
    loading: loading || results[0]?.isLoading,
    error: error,
    loans,
    refetchLoans,
  };
};
