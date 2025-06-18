import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useCookie } from './useCookie';

export const useOriginator = () => {
  const [originator, updateOriginator] = useCookie('originator');

  const { query, push } = useRouter();

  useEffect(() => {
    if (query.originator) {
      updateOriginator(query.originator as string, {
        expires: 180,
      });

      push(
        {
          query: {},
        },
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [push, query, updateOriginator]);

  return originator;
};
