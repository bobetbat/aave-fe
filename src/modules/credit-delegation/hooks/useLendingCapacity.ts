import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { useMemo } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';

// check fn args 2vs3
// import { assetCanBeBorrowedByUser } from 'src/utils/utils';
import { AtomicaDelegationPool } from '../types';

export const useLendingCapacity = (pools?: AtomicaDelegationPool[]) => {
  const { user, reserves, marketReferencePriceInUsd, loading } = useAppDataContext();

  const { currentAccount } = useWeb3Context();

  const lendingCapacity = useMemo(() => {
    if (pools === undefined || loading || !currentAccount || !user) return '0';

    const validReserves = reserves.filter((reserve) => assetCanBeBorrowedByUser(reserve, user));

    const firstReserve = validReserves.find((reserve) => Number(reserve.availableLiquidity) > 0);

    if (firstReserve === undefined) return '0';

    const availableBorrows = user ? Number(getMaxAmountAvailableToBorrow(firstReserve, user)) : 0;

    const vailableBorrowsUSD = valueToBigNumber(availableBorrows)
      .multipliedBy(firstReserve.formattedPriceInMarketReferenceCurrency)
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);

    return vailableBorrowsUSD.toFixed(2);
  }, [reserves, marketReferencePriceInUsd, user, loading, pools, currentAccount]);

  const lent = useMemo(() => {
    if (pools === undefined) return '0';
    return pools
      .reduce((acc, pool) => acc.plus(pool.balanceInUsd ?? 0), valueToBigNumber(0))

      .decimalPlaces(2)
      .toString();
  }, [pools]);

  const averageApy = useMemo(() => {
    if (pools === undefined || Number(lent) === 0) return '0';

    return pools
      .reduce((acc, pool) => {
        return valueToBigNumber(pool.totalApy ?? '0')
          .times(pool.capacityInUsd ?? '0')
          .plus(acc);
      }, valueToBigNumber(0))
      .dividedBy(lent)
      .toString();
  }, [pools, lent]);

  return {
    loading: loading || pools === undefined,
    lendingCapacity,
    lent: lent,
    averageApy,
  };
};
