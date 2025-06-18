import { loader } from 'graphql.macro';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { SubgraphVault } from '../types';
import { useSubgraph } from './useSubgraph';

const VAULTS_QUERY = loader('../queries/vaults.gql');

export const useUserVaults = () => {
  const { currentAccount } = useWeb3Context();
  const { loading, error, data, sync } = useSubgraph<{ vaults: SubgraphVault[] }>(VAULTS_QUERY, {
    skip: !currentAccount,
    variables: {
      owner: currentAccount,
    },
    context: {
      clientName: 'vaults',
    },
  });

  return {
    loading: loading,
    error,
    vaults: data?.vaults ?? [],
    refetch: sync,
  };
};
