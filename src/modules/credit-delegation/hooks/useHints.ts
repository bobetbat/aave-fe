import { useQuery } from '@tanstack/react-query';

interface HintDetails {
  name: string;
  description: string;
}

const parseHintsData = (rows: Record<string, string>[]): HintDetails[] => {
  return rows.map((row) => ({
    name: row.Hint,
    description: row.Description,
  }));
};

const fetchHints = async () => {
  try {
    const response = await fetch('/api/sheet/Hints');
    if (!response.ok) {
      // throw new Error('Failed to fetch Hints');
      console.error('Failed to fetch Hints');
      return;
    }
    const rows = await response.json();
    return parseHintsData(rows);
  } catch (error) {
    console.error('Error fetching Hints:', error);
  }
};

export const useHints = () => {
  const query = useQuery({
    queryKey: ['hints'],
    queryFn: () => fetchHints(),
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  return {
    hints: query.data,
    loading: query.isLoading,
    error: query.error,
  };
};
