import { Box, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { ListHeader } from 'src/components/lists/ListHeader';
import { ListWrapper } from 'src/components/lists/ListWrapper';

import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AssetsToBorrowList } from '../AssetsToBorrow/AssetsToBorrowList';
import { ListLoader } from '../ListLoader';
import { MarketListItem } from './MarketListItem';
import { MarketListItemMobile } from './MarketListItemMobile';

const head = [
  {
    title: 'Asset',
    sortKey: 'symbol',
  },
  {
    title: 'MarketId',
    sortKey: 'id',
  },
  {
    title: 'Name',
    sortKey: 'title',
  },
  {
    title: 'Interest',
    // sortKey: 'amountUsd',
    // tooltip: 'Approved Amount',
    hasHint: true,
  },
  {
    title: 'Available Amount',
    // sortKey: 'requestedAmountUsd',
    // tooltip: 'Requested Amount',
    hasHint: true,
  },
];

export const MarketsList = () => {
  const theme = useTheme();
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);

  const downToLg = useMediaQuery(theme.breakpoints.down('lg'));

  const { markets, loading } = useCreditDelegationContext();

  const handleGoToPage = (_: ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  if (loading)
    return <ListLoader title={<>Markets</>} head={head.map((c) => c.title)} withTopMargin />;

  if (!markets.length) {
    return <AssetsToBorrowList full />;
  }

  return (
    <>
      <ListWrapper
        titleComponent={
          <Typography component="div" variant="h3" sx={{ mr: 4 }}>
            Markets
          </Typography>
        }
        localStorageName="yourLoanApplicationsCreditDelegationTableCollapse"
        withTopMargin
        noData={!markets.length}
      >
        {!downToLg && !!markets.length && (
          <ListHeader
            setSortDesc={setSortDesc}
            setSortName={setSortName}
            sortDesc={sortDesc}
            sortName={sortName}
            columns={head}
          />
        )}

        {downToLg ? (
          markets.map((item) => <MarketListItemMobile key={item.id} {...item} />)
        ) : (
          <>
            {markets.slice((page - 1) * 10, (page - 1) * 10 + 10).map((item) => (
              <MarketListItem key={item.id} {...item} />
            ))}

            {markets.length > 10 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  my: 2,
                }}
              >
                <Pagination
                  count={Math.ceil(markets.length / 10)}
                  page={page}
                  onChange={handleGoToPage}
                />
              </Box>
            )}
          </>
        )}
      </ListWrapper>
    </>
  );
};
