import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListHeader } from 'src/components/lists/ListHeader';
import { ListWrapper } from 'src/components/lists/ListWrapper';

import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AtomicaLoan } from '../../types';
import { handleStandardSort } from '../../utils';
import { ListLoader } from '../ListLoader';
import { LoanListItem } from './LoanListItem';
import { LoanListItemMobile } from './LoanListItemMobile';

const head = [
  {
    title: 'Asset',
    sortKey: 'symbol',
  },
  {
    title: 'PolicyId/LoanRequestId',
    sortKey: 'id',
  },
  {
    title: 'Name',
    sortKey: 'market.title',
  },
  {
    title: 'Principal',
    sortKey: 'borrowedAmountUsd',
  },
  {
    title: 'APR',
    sortKey: 'apr',
  },
  {
    title: 'Interest',
    sortKey: 'interestAccruedUsd',
  },
  {
    title: 'Status',
    sortKey: 'status',
  },
  {
    title: 'Agreement',
    sortKey: 'agreement',
  },
];

export const LoansList = ({ admin }: { admin?: boolean }) => {
  const theme = useTheme();

  const [sortName, setSortName] = useState('createdAt');
  const [sortDesc, setSortDesc] = useState(true);

  const { loading, loans, userLoans } = useCreditDelegationContext();
  const downToLg = useMediaQuery(theme.breakpoints.down('lg'));
  const loanPositions: AtomicaLoan[] = useMemo(() => {
    return handleStandardSort(sortDesc, sortName, admin ? loans : userLoans);
  }, [sortDesc, sortName, loans, userLoans, admin]);
  if (loading)
    return <ListLoader title="Your loans" head={head.map((c) => c.title)} withTopMargin />;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          {admin ? 'Loans' : 'Your loans'}
        </Typography>
      }
      localStorageName="yourLoansCreditDelegationTableCollapse"
      noData={!loanPositions.length}
      withTopMargin
    >
      {!loanPositions.length && <CreditDelegationContentNoData text="Nothing borrowed yet" />}

      {!downToLg && !!loanPositions.length && (
        <ListHeader
          setSortDesc={setSortDesc}
          setSortName={setSortName}
          sortDesc={sortDesc}
          sortName={sortName}
          columns={head}
        />
      )}

      {downToLg
        ? loanPositions.map((item) => (
            <LoanListItemMobile admin={admin} key={item?.apiLoan?.loanId} {...item} />
          ))
        : loanPositions.map((item) => (
            <LoanListItem admin={admin} key={item?.apiLoan?.loanId} {...item} />
          ))}
    </ListWrapper>
  );
};
