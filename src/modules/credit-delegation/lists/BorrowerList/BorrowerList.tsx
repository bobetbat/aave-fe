import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListHeader } from 'src/components/lists/ListHeader';
import { ListWrapper } from 'src/components/lists/ListWrapper';

import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AtomicaDelegationPool } from '../../types';
import { ListLoader } from '../ListLoader';
import { BorrowerListItem } from './BorrowerListItem';
import { BorrowerListItemMobile } from './BorrowerListItemMobile';

const head = [
  {
    title: 'Product',
    sortKey: 'product',
    hasHint: true,
    tooltip: 'Product',
  },
  { title: 'Borrower', sortKey: 'market' },
  {
    title: 'Credit line size',
    sortKey: 'creditLine',
    tooltip: 'Credit line size',
    hasHint: true,
  },
];

export const BorrowerList = ({ poolId }: { poolId: string }) => {
  const theme = useTheme();

  const downToLg = useMediaQuery(theme.breakpoints.down('lg'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { pools, loading, loans } = useCreditDelegationContext();

  const borrowersList = useMemo(
    () => pools.find((pool) => pool.id === poolId) as AtomicaDelegationPool,
    [poolId, pools]
  );

  const borrowersWithCreditLines = useMemo(
    () =>
      borrowersList?.markets?.map((market) => {
        const creditLine = loans
          .filter((loan) => loan.market?.id === market.id)
          .reduce((sum, loan) => {
            const amount = parseFloat(loan.borrowedAmountFormatted);
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        // borrowedAmountFormatted
        return {
          ...market,
          creditLine: creditLine,
        };
      }),
    [borrowersList]
  );

  if (loading)
    return (
      <ListLoader
        title="Loan Products & Borrowers This Pool Seeks To Issue Loans To"
        head={head.map((c) => c.title)}
        withTopMargin
      />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          Loan Products & Borrowers This Pool Seeks To Issue Loans To
        </Typography>
      }
      localStorageName="loanPositionsCreditDelegationTableCollapse"
      noData={!borrowersList}
      withTopMargin
    >
      {!borrowersList?.markets?.length && (
        <CreditDelegationContentNoData text={'No borrowers yet'} />
      )}

      {!downToLg && !!borrowersList?.markets?.length && (
        <ListHeader
          setSortDesc={setSortDesc}
          setSortName={setSortName}
          sortDesc={sortDesc}
          sortName={sortName}
          columns={head}
        />
      )}

      {downToLg
        ? borrowersWithCreditLines?.map((item) => (
            <BorrowerListItemMobile key={item.id} {...item} />
          ))
        : borrowersWithCreditLines?.map((item) => <BorrowerListItem key={item.id} {...item} />)}
    </ListWrapper>
  );
};
