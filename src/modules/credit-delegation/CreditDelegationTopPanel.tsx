import { Stack } from '@mui/material';
import * as React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useCreditDelegationContext } from './CreditDelegationContext';
// import { useZapper } from './hooks/useZapper';

export const CreditDelegationTopPanel = () => {
  const { currentAccount } = useWeb3Context();

  const {
    loading,
    lent,
    averageApy,
    // averageApr,
    // borrowed,
    // borrowingCapacity,
    // loansLoading,
  } = useCreditDelegationContext();

  // const { balances, loading: zapperLoading } = useZapper();

  // const { pools } = useCreditDelegationContext();

  // const poolTokens = React.useMemo(
  //   () => pools.map((pool) => pool.underlyingAsset.toLowerCase()),
  //   [pools]
  // );

  // const sumLendingCapacity = React.useMemo(() => {
  //   if (!balances) return Number(lendingCapacity);
  //   return (
  //     balances.reduce((acc, item) => {
  //       if (poolTokens.includes(item.address.toLowerCase())) {
  //         return acc + item.balanceUSD;
  //       }

  //       return acc;
  //     }, 0) + Number(lendingCapacity)
  //   );
  // }, [balances, lendingCapacity, poolTokens]);

  return (
    <Stack mt={4} gap={4} direction="row">
      <TopInfoPanelItem
        title="Lent"
        loading={loading}
        value={currentAccount ? Number(lent ?? 0) : undefined}
        symbol="USD"
        hintId="Lent"
      />

      <TopInfoPanelItem
        title="Average APY"
        loading={loading}
        value={currentAccount ? averageApy : undefined}
        percent
        hintId="Average APY"
      />

      {/* <TopInfoPanelItem
          title="Borrowing capacity"
          loading={loansLoading}
          value={currentAccount ? borrowingCapacity : undefined}
          symbol="USD"
          hintId="Borrowing capacity"
        />

        <TopInfoPanelItem
          title="Borrowed"
          loading={loansLoading}
          value={currentAccount ? Number(borrowed || 0) : undefined}
          symbol="USD"
          hintId="Borrowed"
        />

        <TopInfoPanelItem
          title="Average APR"
          loading={loansLoading}
          value={currentAccount ? averageApr : undefined}
          percent
          hintId="Average APR"
        /> */}
    </Stack>
  );
};
