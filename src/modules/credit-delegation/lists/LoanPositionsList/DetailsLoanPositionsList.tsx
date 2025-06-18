import { Box, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import { ListHeader } from 'src/components/lists/ListHeader';
import { ListWrapper } from 'src/components/lists/ListWrapper';

import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { handleStandardSort } from '../../utils';
import { ListLoader } from '../ListLoader';
import { DetailsLoanPositionsListItem } from './DetailsLoanPositionsListItem';
import { DetailsLoanPositionsListItemMobile } from './DetailsLoanPositionsListItemMobile';

const head = [
  { title: 'Loan ID', sortKey: 'loanId' },
  { title: 'Date', sortKey: 'loan.createdAt' },
  { title: 'APY', sortKey: 'apr' },
  { title: 'Borrower', sortKey: 'market.product.title' },
  {
    title: 'Principal',
    sortKey: 'loan.borrowedAmountUsd',
    tooltip: 'Principal',
    hasHint: true,
  },
  {
    title: 'Interest',
    sortKey: 'loan.interestAccruedUsd',
    tooltip: 'Interest',
    hasHint: true,
  },
];

export const DetailsLoanPositionsList = ({ poolId }: { poolId: string }) => {
  const theme = useTheme();

  const downToLg = useMediaQuery(theme.breakpoints.down('lg'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);

  const { loading, loans } = useCreditDelegationContext();

  const sortedLendingPositions = useMemo(
    () =>
      handleStandardSort(
        sortDesc,
        sortName,
        loans.filter((item) => item.apiLoan?.chunks[0]?.poolId === poolId)
      ),
    [sortDesc, sortName, loans, poolId]
  );

  const handleGoToPage = (_: ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  if (loading)
    return (
      <ListLoader title="Loans funded by this pool" head={head.map((c) => c.title)} withTopMargin />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          Loans funded by this pool
        </Typography>
      }
      localStorageName="loanPositionsCreditDelegationTableCollapse"
      noData={!sortedLendingPositions.length}
      withTopMargin
    >
      {!sortedLendingPositions.length && <CreditDelegationContentNoData text="Nothing lent yet" />}

      {!downToLg && !!sortedLendingPositions.length && (
        <ListHeader
          setSortDesc={setSortDesc}
          setSortName={setSortName}
          sortDesc={sortDesc}
          sortName={sortName}
          columns={head}
        />
      )}

      {downToLg ? (
        sortedLendingPositions.map((item) => (
          <DetailsLoanPositionsListItemMobile key={item.id} {...item} />
        ))
      ) : (
        <>
          {sortedLendingPositions.slice((page - 1) * 10, (page - 1) * 10 + 10).map((item) => (
            <DetailsLoanPositionsListItem key={item.id} {...item} />
          ))}

          {sortedLendingPositions.length > 10 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
              }}
            >
              <Pagination
                count={Math.ceil(sortedLendingPositions.length / 10)}
                page={page}
                onChange={handleGoToPage}
              />
            </Box>
          )}
        </>
      )}
    </ListWrapper>
  );
};
