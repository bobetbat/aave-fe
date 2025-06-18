import { gql, QueryHookOptions, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRootStore } from 'src/store/root';

interface Meta {
  _meta: {
    block: {
      number: number;
    };
  };
}

// Helper function to serialize variables into a GraphQL string format
const embedVariablesInQuery = (query: string, variables: Record<string, string>): string => {
  let queryString = query;

  // Remove the query/mutation parameter definition (e.g., `query GetUser($id: ID!, $name: String!)`)
  queryString = queryString.replace(/query\s+\w*\s*\([^)]+\)\s*|\bquery\s+\w*\s*/g, '');

  // Loop through each variable and replace it in the query
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\$${key}`, 'g');
    let replacedValue;
    if (Array.isArray(value)) {
      // Convert array values to GraphQL-friendly format
      replacedValue = `[${value.map((v) => `"${v}"`).join(', ')}]`;
    } else if (!value) {
      replacedValue = `""`;
    } else if (typeof value === 'string' || typeof value === 'number') {
      replacedValue = `"${value}"`;
    } else {
      replacedValue = value;
    }
    queryString = queryString.replace(regex, replacedValue);
  }

  return queryString;
};

// Convert DocumentNode (GraphQL query) into a string
const documentNodeToString = (query: DocumentNode): string => {
  return query?.loc?.source?.body ?? '';
};

// Main hook
export const useSubgraph = <T>(query: DocumentNode, options?: QueryHookOptions) => {
  const chainId = useRootStore((store) => store.currentChainId);

  const [lastBlockNumber, setLastBlockNumber] = useState(0);

  // We still define `resolve` in case future usage calls for it
  const [resolve] = useState<(blockNumber: number) => void>(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });

  // Embed variables in the query string
  const finalQuery = useMemo(() => {
    const variables = options?.variables;
    const queryString = documentNodeToString(query);
    if (!variables) return query;

    // Embed variables into the query string
    const embeddedQuery = embedVariablesInQuery(queryString, variables);
    // Convert the embedded query string back to DocumentNode using gql
    return gql`
      ${embeddedQuery}
    `;
  }, [query, options?.variables]);

  const { loading, refetch, data, startPolling, stopPolling, networkStatus, ...response } =
    useQuery<T & Meta>(finalQuery, {
      ...options,
      context: {
        chainId: chainId,
        ...options?.context,
      },
      notifyOnNetworkStatusChange: true,
    });

  const blockNumber = data?._meta?.block?.number;

  useEffect(() => {
    if (blockNumber && blockNumber > lastBlockNumber) {
      resolve(blockNumber);
    }
  }, [blockNumber, lastBlockNumber, resolve]);

  const sync = useCallback(
    async (targetBlockNumber?: number) => {
      if (targetBlockNumber && targetBlockNumber > lastBlockNumber) {
        setLastBlockNumber(targetBlockNumber);
      }

      await refetch();
    },
    [lastBlockNumber, refetch]
  );

  return useMemo(() => {
    return {
      loading,
      refetch,
      sync,
      data,
      startPolling,
      stopPolling,
      networkStatus,
      ...response,
    };
  }, [
    data,
    loading,
    refetch,
    response,
    sync,
    startPolling,
    stopPolling,
    networkStatus,
    blockNumber,
    lastBlockNumber,
  ]);
};
