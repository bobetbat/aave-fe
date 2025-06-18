import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { compact, uniqBy } from 'lodash';
import { useMemo, useState } from 'react';
import { ColumnConfig, ListHeader } from 'src/components/lists/ListHeader';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AssetToBorrow } from '../../types';
import { handleStandardSort } from '../../utils';
import { ListLoader } from '../ListLoader';
import { AssetsToBorrowListItem } from './AssetsToBorrowListItem';
import { AssetsToBorrowListItemMobile } from './AssetsToBorrowListItemMobile';

const head: ColumnConfig[] = [
  {
    title: 'Asset',
    sortKey: 'symbol',
  },
  {
    title: 'Available',
    sortKey: 'availableUsd',
    tooltip: 'Available',
    hasHint: true,
  },

  // {
  //   title: 'APR',
  //   sortKey: 'maxApr',
  //   tooltip: 'APR',
  //   hasHint: true,
  // },
];

const fullHead = [
  ...head,
  {
    title: 'Available Loan Durations',
  },
  {
    title: 'Available Collaterals',
    basis: 800,
  },
];

export const AssetsToBorrowList = ({ full = false }: { full?: boolean }) => {
  const { markets, loading: marketsLoading } = useCreditDelegationContext();

  const rows: AssetToBorrow[] = useMemo(() => {
    if (marketsLoading) return [];
    const tokens = compact(
      uniqBy(
        markets.map((market) => market.asset),
        'address'
      )
    );

    return tokens.map((token) => {
      const rowMarkets = markets.filter((market) => market.asset?.address === token.address);
      return {
        asset: token,
        markets: rowMarkets,
        minApr: Math.min(...rowMarkets.map((market) => Number(market.apr))) / 100,
        maxApr: Math.max(...rowMarkets.map((market) => Number(market.apr))) / 100,
        available: rowMarkets.reduce((acc, market) => acc + Number(market.availableBorrows), 0),
        availableUsd: rowMarkets.reduce(
          (acc, market) => acc + Number(market.availableBorrowsInUSD),
          0
        ),
      };
    });
  }, [markets, marketsLoading]);

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const sortedRows = useMemo(() => {
    return handleStandardSort(sortDesc, sortName, rows);
  }, [rows, sortDesc, sortName]);

  const borrowDisabled = !rows.length;

  if (marketsLoading)
    return (
      <ListLoader
        withTopMargin
        title="Assets to borrow"
        head={(full ? fullHead : head).map((col) => col.title)}
        sx={{
          flex: '1 1 50%',
        }}
      />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          Assets to borrow
        </Typography>
      }
      localStorageName="assetsToBorrowTableCollapse"
      noData={borrowDisabled}
      sx={{
        flex: '1 1 50%',
      }}
      withTopMargin
      disableCollapse
    >
      {!sortedRows.length && <CreditDelegationContentNoData text="No assets to lend" />}
      {!downToXSM && !!rows.length && (
        <ListHeader
          sortName={sortName}
          sortDesc={sortDesc}
          setSortName={setSortName}
          setSortDesc={setSortDesc}
          columns={full ? fullHead : head}
        />
      )}
      {downToXSM
        ? sortedRows?.map((item) => (
            <AssetsToBorrowListItemMobile {...item} key={item.asset.address} />
          ))
        : sortedRows?.map((item) => (
            <AssetsToBorrowListItem
              {...item}
              key={item.asset.address}
              full={full}
              columns={full ? fullHead : head}
            />
          ))}
    </ListWrapper>
  );
};
