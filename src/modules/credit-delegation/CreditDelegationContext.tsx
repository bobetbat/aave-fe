import { ApolloProvider } from '@apollo/client';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { client } from './apollo';
import { useBorrowed } from './hooks/useBorrowed';
import { useLendingCapacity } from './hooks/useLendingCapacity';
import { useOriginator } from './hooks/useOriginator';
import { usePoolsAndMarkets } from './hooks/usePoolsAndMarkets';
import {
  AtomicaBorrowMarket,
  AtomicaDelegationPool,
  AtomicaLoan,
  AtomicaSubgraphPolicy,
} from './types';

export enum Tabs {
  OVERVIEW = 'overview',
  DELEGATE = 'delegate',
  BORROW = 'borrow',
  PORTFOLIO = 'portfolio',
  ADMIN = 'admin',
}

export interface CreditDelgationData {
  loading: boolean;
  pools: AtomicaDelegationPool[];
  borrowed: string;
  lent: string;
  borrowingCapacity: string;
  averageApr: string;
  averageApy: string;
  markets: AtomicaBorrowMarket[];
  loans: AtomicaLoan[];
  userLoans: AtomicaLoan[];
  myPolicies: AtomicaSubgraphPolicy[];
  originator?: string;
  refetchLoans: (blockNumber?: number) => Promise<void>;
  refetchAll: (blockNumber?: number) => Promise<void>;
  refetchVaults: (blockNumber?: number) => Promise<void>;
}

export const CreditDelegationContext = createContext({
  pools: [],
  borrowed: '0',
  lent: '0',
  borrowingCapacity: '0',
  averageApr: '0',
  averageApy: '0',
  markets: [],
  loans: [],
  userLoans: [],
  loading: true,
  loansLoading: true,
  myPolicies: [],
  originator: undefined,
  refetchLoans: () => Promise.reject(),
  refetchAll: () => Promise.reject(),
  refetchVaults: () => Promise.reject(),
  filteredPools: [],
} as CreditDelgationData);

const CreditDelegationDataProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null => {
  const {
    loading,
    pools,
    markets,
    loans,
    userLoans,
    myPolicies,
    refetchLoans,
    refetchAll,
    refetchVaults,
  } = usePoolsAndMarkets();

  const originator = useOriginator();

  const { lent, averageApy } = useLendingCapacity(loading ? undefined : pools);

  const { borrowed, apr, borrowingCapacity } = useBorrowed(loans);

  return (
    <CreditDelegationContext.Provider
      value={useMemo(
        () => ({
          loading,
          pools,
          borrowed,
          lent,
          borrowingCapacity,
          averageApr: apr,
          averageApy,
          markets,
          loans,
          userLoans,
          originator,
          myPolicies,
          refetchLoans,
          refetchVaults,
          refetchAll,
        }),
        [
          loading,
          pools,
          borrowed,
          lent,
          borrowingCapacity,
          apr,
          averageApy,
          markets,
          loans,
          userLoans,
          originator,
          myPolicies,
          refetchLoans,
          refetchVaults,
          refetchAll,
        ]
      )}
    >
      {children}
    </CreditDelegationContext.Provider>
  );
};

export const CreditDelegationProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null => {
  return (
    <ApolloProvider client={client}>
      <CreditDelegationDataProvider>{children}</CreditDelegationDataProvider>
    </ApolloProvider>
  );
};

export const useCreditDelegationContext = () => {
  const context = useContext(CreditDelegationContext);

  if (context === undefined) {
    throw new Error(
      'useCreditDelegationContext() can only be used inside of <CreditDelegationProvider />, ' +
        'please declare it at a higher level.'
    );
  }

  return context;
};
