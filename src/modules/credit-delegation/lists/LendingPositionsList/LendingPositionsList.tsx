import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListHeader } from 'src/components/lists/ListHeader';
import { ListWrapper } from 'src/components/lists/ListWrapper';

import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { handleStandardSort } from '../../utils';
import { ListLoader } from '../ListLoader';
import { LendingPositionsListItem } from './LendingPositionsListItem';
import { LendingPositionsListItemMobile } from './LendingPositionsListItemMobile';

const head = [
  { title: 'Assets', sortKey: 'symbol' },
  { title: 'Pool Description', sortKey: 'title' },
  {
    title: 'My Pool Balance',
    sortKey: 'balance',
    tooltip: 'My Pool Balance',
    hasHint: true,
  },
  // {
  //   title: 'Unclaimed Earnings',
  //   sortKey: 'earnings',
  //   tooltip: 'Unclaimed Earnings',
  //   hasHint: true,
  // },
  { title: 'APY', sortKey: 'supplyAPY', tooltip: 'APY', hasHint: true },
];

interface LendingPositionsListProps {
  type: string;
}

export const LendingPositionsList = ({ type }: LendingPositionsListProps) => {
  const theme = useTheme();
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { loading, pools } = useCreditDelegationContext();

  const downToLg = useMediaQuery(theme.breakpoints.down('lg'));
  const { earningPools, deficitPools } = pools.reduce(
    (acc, pool) => {
      if (!pool.balance || Number(pool?.balance) === 0) {
        return acc;
      }
      (Number(pool.totalApy) > 0 ? acc.earningPools : acc.deficitPools).push(pool);
      return acc;
    },
    { earningPools: [], deficitPools: [] } as {
      earningPools: typeof pools;
      deficitPools: typeof pools;
    }
  );

  const sortedPools = useMemo(
    () => handleStandardSort(sortDesc, sortName, type === 'earning' ? earningPools : deficitPools),
    [sortDesc, sortName, type, earningPools, deficitPools]
  );

  if (loading)
    return (
      <ListLoader title={`Your ${type} positions`} head={head.map((c) => c.title)} withTopMargin />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          {`Your ${type} positions`}
        </Typography>
      }
      localStorageName="lendingPositionsCreditDelegationTableCollapse"
      noData={!sortedPools.length}
      withTopMargin
    >
      {!sortedPools.length && <CreditDelegationContentNoData text="Nothing lent yet" />}

      {!downToLg && !!sortedPools.length && (
        <ListHeader
          setSortDesc={setSortDesc}
          setSortName={setSortName}
          sortDesc={sortDesc}
          sortName={sortName}
          columns={head}
        />
      )}

      {downToLg
        ? sortedPools.map((item) => (
            <LendingPositionsListItemMobile key={item.id} poolVault={item} />
          ))
        : sortedPools.map((item) => <LendingPositionsListItem key={item.id} poolVault={item} />)}
    </ListWrapper>
  );
};
