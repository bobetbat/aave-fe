import { useQuery } from '@tanstack/react-query';

export enum SheetPoolStatus {
  REPAID = 'REPAID',
  SOLD_OUT = 'SOLD OUT',
  ACTIVE = 'ACTIVE',
}

interface PoolInfo {
  name: string;
  description: string;
  allowWithdrawals: boolean;
  apy: number;
  status: SheetPoolStatus;
  warning: string;
  hidden: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parsePoolData = (rows: any[]): Record<string, PoolInfo> => {
  return rows.reduce((p, row) => {
    return {
      ...p,
      [row['Address'].toLowerCase()]: {
        name: row['Name'],
        description: row['Description'],
        allowWithdrawals: row['Allow Withdrawals'] === 'Allow',
        apy: row['APY'] ? Number(row['APY']) / 100 : undefined,
        status: row['Status'] as SheetPoolStatus,
        warning: row['Warning'],
        hidden: row['Hidden'] === 'TRUE',
      },
    };
  }, {} as Record<string, PoolInfo>);
};

const fetchPools = async () => {
  const response = await fetch('/api/sheet/Pools');
  if (!response.ok) {
    throw new Error('Failed to fetch Pool data');
  }
  const rows = await response.json();
  return parsePoolData(rows);
};

export const usePoolsSheet = () => {
  const query = useQuery({
    queryFn: () => fetchPools(),
    queryKey: ['poolInfo'],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  return query.data;
};

export const usePoolSheetConfig = (poolId?: string) => {
  const data = usePoolsSheet();

  return poolId === undefined ? undefined : data?.[poolId.toLowerCase()];
};
