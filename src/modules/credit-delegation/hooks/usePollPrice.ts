import { useEffect, useState } from 'react';

import { createCache } from '../cache';

const TOKEN_IDS: string[] = [];

const INTERVAL = 1000 * 60 * 5;

const cache = createCache<number>({ expirationDelay: INTERVAL });

let timeOut: NodeJS.Timeout | undefined;

const fetchPrices = async () => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_IDS.join(',')}&vs_currencies=usd`
    );

    if (response.ok) {
      const data = await response.json();

      Object.entries(data).forEach(([token, res]) => {
        cache.set(token.toLowerCase(), (res as { usd: number }).usd);
      });

      return data;
    }
  } catch (e) {
    console.error(e);

    return {};
  }
};

const poll = async (tokenIds: string[]) => {
  TOKEN_IDS.push(
    ...tokenIds.map((token) => token.toLowerCase()).filter((token) => !TOKEN_IDS.includes(token))
  );

  if (timeOut === undefined) {
    const res = await fetchPrices();

    const realInterval = res.status === 429 ? INTERVAL * 10 : INTERVAL;

    timeOut = setInterval(fetchPrices, realInterval);
  }
};

export const usePollPrice = (tokenId?: string) => {
  const [price, setPrice] = useState<number | undefined>(
    tokenId ? cache.get(tokenId.toLowerCase()) : undefined
  );

  useEffect(() => {
    if (!tokenId) return;

    const currentPrice = cache.get(tokenId.toLowerCase());

    if (currentPrice) {
      setPrice(currentPrice);
    }

    poll([tokenId]);
  }, [tokenId]);

  useEffect(() => {
    if (!tokenId) return;
    const unsubscribe = cache.subscribe(tokenId.toLowerCase(), setPrice);

    return unsubscribe;
  }, [tokenId]);

  return price;
};

export const stopPolling = () => {
  if (timeOut) {
    clearInterval(timeOut);
    timeOut = undefined;
  }
};
