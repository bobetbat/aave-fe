import { useQuery } from '@tanstack/react-query';

import { NetworkSheetConfig } from '../types';

const parseEnvSheetData = (rows: Record<string, string>[]): Record<string, NetworkSheetConfig> => {
  return rows.reduce((p, row) => {
    return {
      ...p,
      [row['chainId']]: {
        chainId: row['chainId']?.toLowerCase() ?? '',
        chainName: row['name']?.toLowerCase() ?? '',
        rpcUrl: row['rpcUrl']?.toLowerCase() ?? '',
        productIds: row['productIds']?.toLowerCase().split(',') ?? [],
        marketIds: row['marketIds']?.toLowerCase().split(',') ?? [],
        poolOperatorIds: row['poolOperatorIds']?.toLowerCase().split(',') ?? [],
        frontendOperatorAddress: row['frontendOperatorAddress']?.toLowerCase() ?? '',
        lendingFactoryAddress: row['lendingFactoryAddress']?.toLowerCase() ?? '',
        loanTriggerListId: row['loanTriggerListId']?.toLowerCase() ?? '',
        vaultFactoryAddress: row['vaultFactoryAddress']?.toLowerCase() ?? '',
      },
    };
  }, {} as Record<string, NetworkSheetConfig>);
};

const fetchSheetConfig = async () => {
  const response = await fetch('/api/sheet/Network');
  if (!response.ok) {
    throw new Error('Failed to fetch Env sheet data');
  }
  const rows = await response.json();
  return parseEnvSheetData(rows);
};

export const useNetworkSheetConfig = () => {
  const query = useQuery({
    queryKey: ['networkConfig'],
    queryFn: () => fetchSheetConfig(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  return query;
};
