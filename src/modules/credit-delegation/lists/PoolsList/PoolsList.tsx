import { Box, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import { ColumnConfig, ListHeader } from 'src/components/lists/ListHeader';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { handleStandardSort } from '../../utils';
import { ListLoader } from '../ListLoader';
import { PoolListItem } from './PoolListItem';
import { PoolListItemMobile } from './PoolListItemMobile';

const head: ColumnConfig[] = [
  { title: 'Assets', sortKey: 'symbol' },
  {
    title: 'Pool Description',
    sortKey: 'metadata.Label',
    basis: 360,
  },
  {
    title: 'Pool Balance',
    tooltip: 'Pool Balance',
    hasHint: true,
  },
  {
    title: 'Pool Capacity',
    tooltip: 'Pool Capacity',
    hasHint: true,
  },
  { title: 'APY', sortKey: 'totalApy', hasHint: true, tooltip: 'APY' },
];

export const PoolsList = () => {
  const theme = useTheme();

  const downToLg = useMediaQuery(theme.breakpoints.down('lg'));

  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);

  const { loading: loadingPools, pools } = useCreditDelegationContext();

  const sortedPools = useMemo(
    () => handleStandardSort(sortDesc, sortName, pools),
    [sortDesc, sortName, pools]
  );
  const handleGoToPage = (_: ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  if (loadingPools)
    return (
      <ListLoader
        head={head.map((col) => col.title)}
        title="Pools to lend to using your line of credit and assets in your wallet"
        withTopMargin
      />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          Pools to lend to using your line of credit and assets in your wallet
        </Typography>
      }
      localStorageName="delegateAssetsTableCollapse"
      noData={!sortedPools.length}
      withTopMargin
    >
      <>
        {!downToLg && !!sortedPools.length && (
          <ListHeader
            sortName={sortName}
            setSortName={setSortName}
            sortDesc={sortDesc}
            setSortDesc={setSortDesc}
            columns={head}
          />
        )}

        {!sortedPools.length && <CreditDelegationContentNoData text="No pools found" />}

        {downToLg ? (
          sortedPools.map((item) => <PoolListItemMobile key={item.id} {...item} />)
        ) : (
          <>
            {sortedPools.slice((page - 1) * 10, (page - 1) * 10 + 10).map((item) => (
              <PoolListItem key={item.id} {...item} columns={head} />
            ))}

            {sortedPools.length > 10 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  my: 2,
                }}
              >
                <Pagination
                  count={Math.ceil(sortedPools.length / 10)}
                  page={page}
                  onChange={handleGoToPage}
                />
              </Box>
            )}
          </>
        )}
      </>
    </ListWrapper>
  );
};
