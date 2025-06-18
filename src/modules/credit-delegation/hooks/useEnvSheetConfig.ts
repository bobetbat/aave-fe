import { useQuery } from '@tanstack/react-query';

export interface EnvSheetConfig {
  appLogoDark: string;
  appLogoLight: string;
  logoTitle: string;
  contactUrl: string;
}

const parseEnvSheetData = (rows: Record<string, string>[]): EnvSheetConfig => {
  return rows.reduce((p, row) => {
    return {
      ...p,
      [row['Name']]: row['Value'],
    };
  }, {} as EnvSheetConfig);
};

const fetchEnvSheet = async () => {
  const response = await fetch('/api/sheet/Env');
  if (!response.ok) {
    throw new Error('Failed to fetch Env sheet data');
  }
  const rows = await response.json();
  return parseEnvSheetData(rows);
};

export const useEnvSheetConfig = () => {
  const query = useQuery({
    queryKey: ['envConfig'],
    queryFn: () => fetchEnvSheet(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  return query.data;
};
