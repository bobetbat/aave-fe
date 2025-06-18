import { normalizeBN } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { Contract } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import ERC20ABI from 'src/modules/credit-delegation/abi/ERC20.json';

import { useOnChange } from './useOnChange';
import { stopPolling, usePollPrice } from './usePollPrice';
import { useTokensData } from './useTokensData';
import { useZapper } from './useZapper';

export const useWalletBalance = (tokenAddress?: string) => {
  const { currentAccount, provider } = useWeb3Context();
  const { data: tokens } = useTokensData(
    useMemo(() => (tokenAddress ? [tokenAddress] : undefined), [tokenAddress])
  );

  const { balances: zapperBalances } = useZapper();

  const zapperBalance = zapperBalances?.find(
    (item) => item.address.toLowerCase() === tokenAddress?.toLowerCase()
  );

  const tokenId =
    tokens?.[0]?.symbol === 'USDC'
      ? 'usd-coin'
      : tokens?.[0]?.symbol.replace(' ', '-').toLowerCase();

  const price = usePollPrice(tokenId);

  const [walletBalance, setBalance] = useState<string | undefined>();

  const getBalance = useCallback(async () => {
    if (zapperBalance) {
      stopPolling();
      setBalance(zapperBalance.balanceNormalized.toString());
      return;
    }

    if (currentAccount && tokenAddress) {
      const contract = new Contract(tokenAddress, ERC20ABI, provider);

      const balance = await contract.balanceOf(currentAccount.toLowerCase());

      const decimals = await contract.decimals();

      const amount = normalizeBN(balance.toString(), decimals);

      return amount.toString();
    }

    return undefined;
  }, [currentAccount, provider, tokenAddress, zapperBalance]);

  useOnChange(
    tokenAddress,
    useCallback(() => setBalance(undefined), [])
  );

  useOnChange(
    currentAccount,
    useCallback(() => setBalance(undefined), [])
  );

  useEffect(() => {
    let isMounted = true;

    if (currentAccount && tokenAddress && walletBalance === undefined) {
      getBalance().then((balances) => {
        if (isMounted) {
          setBalance(balances);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentAccount, getBalance, tokenAddress, walletBalance]);

  return {
    amount: walletBalance,
    amountUSD: BigNumber(walletBalance ?? 0)
      .times(price ?? 0)
      .toString(),
    price,
  };
};
