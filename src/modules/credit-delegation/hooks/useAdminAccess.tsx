import { loader } from 'graphql.macro';
import { useMemo } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useCreditDelegationContext } from '../CreditDelegationContext';
import { AtomicaBorrowMarket } from '../types';
import { useSubgraph } from './useSubgraph';

const PROCESSORS_QUERY = loader('../queries/lendingOutflowProcessors.gql');

export interface ILendingOutflowProessor {
  id: string;
  approver: string;
  rpcAddress: string;
  data: string;
  lastLoanRequestId: string;
  lastLoanId: string;
  asset: string;
  list: string;
  timelock: string;
}
const getApprovers = (
  markets: AtomicaBorrowMarket[],
  outflowProcessors: ILendingOutflowProessor[]
): string[] => {
  const processorMap = new Map<string, string>(
    outflowProcessors.map((processor) => [processor.id, processor.approver])
  );

  return markets
    .map((market) => processorMap.get(market.outflowProcessor))
    .filter((approver): approver is string => approver !== undefined);
};

export const useAdminAccess = () => {
  const { markets } = useCreditDelegationContext();
  const { currentAccount } = useWeb3Context();

  const { data: processorsData } = useSubgraph<{
    lendingOutflowProcessors: ILendingOutflowProessor[];
  }>(PROCESSORS_QUERY);

  const isAdmin = useMemo(() => {
    if (!processorsData || !currentAccount) return false;
    const approversList = getApprovers(markets, processorsData.lendingOutflowProcessors);
    const isInList = approversList.includes(currentAccount);
    return isInList;
  }, [currentAccount, markets, processorsData]);

  return isAdmin;
};
