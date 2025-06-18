import { useQuery } from '@tanstack/react-query';

interface QuestionDetails {
  question: string;
  answer: string;
}

const parseFaqData = (rows: Record<string, string>[]): QuestionDetails[] => {
  return rows.map((row) => ({
    question: row.Question,
    answer: row.Answer,
  }));
};

const fetchFaq = async () => {
  try {
    const response = await fetch('/api/sheet/FAQ');
    if (!response.ok) {
      throw new Error('Failed to fetch FAQ');
    }
    const rows = await response.json();
    return parseFaqData(rows);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    throw error;
  }
};

export const useFaq = () => {
  const query = useQuery({
    queryKey: ['faq'],
    queryFn: () => fetchFaq(),
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  return {
    faq: query.data,
    loading: query.isLoading,
    error: query.error,
  };
};
