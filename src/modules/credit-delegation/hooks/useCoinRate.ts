'use client';
import { TokenMap } from './useRiskPool';

export type Rate = { [key: string]: { usd: number; timestamp: number } };

let cache: Rate = {};

if (typeof window !== 'undefined') {
  cache = JSON.parse(localStorage.getItem('coinRate') || '{}');
}

const EXPIRATION_OFFSET = 600000;

export const useCoinRate = () => {
  const getCoinPriceUrl = (coinIds: string[]) =>
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`;

  const getCoinId = (tokenName: string) =>
    tokenName === 'USDC' ? 'usd-coin' : tokenName.replace(' ', '-').toLowerCase();

  const getPrice = async (coinIds: string[]) => {
    try {
      if (
        coinIds.every(
          (coinId) => cache[coinId] && Date.now() - cache[coinId].timestamp < EXPIRATION_OFFSET
        )
      ) {
        return cache;
      }

      const response = await fetch(getCoinPriceUrl(coinIds));

      if (response.ok) {
        const rate: Rate = await response.json();

        const withTimestamp = Object.entries(rate).reduce((acc, [key, value]) => {
          acc[key] = { ...value, timestamp: Date.now() };
          return acc;
        }, {} as Rate);

        cache = { ...cache, ...withTimestamp };

        localStorage.setItem('coinRate', JSON.stringify(cache));
      }
      return cache;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getPriceMap = async (tokens: TokenMap) => {
    const coinIds = Object.keys(tokens).filter((key) => tokens[key].tokenUsdPrice === 0);

    try {
      if (!coinIds.length) return;
      const rates: Rate = await getPrice(coinIds);
      Object.entries(rates).forEach(([coinId, { usd }]) => {
        if (!tokens[coinId]) return;
        tokens[coinId].tokenUsdPrice = usd;
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getPriceMap,
    getPrice,
    getCoinId,
  };
};
