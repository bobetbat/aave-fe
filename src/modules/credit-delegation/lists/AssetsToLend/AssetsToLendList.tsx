import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListHeader } from 'src/components/lists/ListHeader';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { useAssetsToLend } from '../../hooks/useAssetsToLend';
import { handleStandardSort } from '../../utils';
import { ListLoader } from '../ListLoader';
import { AssetsToLendListItem } from './AssetsToLendListItem';
import { AssetsToLendListItemMobile } from './AssetToLendListItemMobile';

const head = [
  {
    title: 'Asset',
    sortKey: 'symbol',
  },
  {
    title: 'APY',
    sortKey: 'apy',
    tooltip: 'APY',
    hasHint: true,
  },
  {
    title: 'Secured By',
    sortKey: 'securedBy',
    tooltip: 'Secured By',
    hasHint: true,
  },
  {
    title: 'My Wallet',
    sortKey: 'lendingCapacityWallet',
    tooltip: 'My Wallet',
    hasHint: true,
  },
];

export const AssetsToLendList = () => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { loading } = useCreditDelegationContext();

  const assets = useAssetsToLend();
  const sortedAssets = useMemo(
    () => handleStandardSort(sortDesc, sortName, assets),
    [sortDesc, sortName, assets]
  );
  const borrowDisabled = !sortedAssets.length;

  if (loading)
    return (
      <ListLoader
        withTopMargin
        title="Assets to lend"
        head={head.map((col) => col.title)}
        sx={{
          flex: '1 1 50%',
        }}
      />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          Assets to lend
        </Typography>
      }
      localStorageName="assetsToLendTableCollapse"
      noData={borrowDisabled}
      sx={{
        flex: '1 1 50%',
      }}
      withTopMargin
      disableCollapse
    >
      {!sortedAssets.length && <CreditDelegationContentNoData text="No assets to lend" />}
      {!downToXSM && !!sortedAssets.length && (
        <ListHeader
          sortName={sortName}
          sortDesc={sortDesc}
          setSortName={setSortName}
          setSortDesc={setSortDesc}
          columns={head}
        />
      )}
      {downToXSM
        ? sortedAssets?.map((item) => <AssetsToLendListItemMobile {...item} key={item.key} />)
        : sortedAssets?.map((item) => <AssetsToLendListItem {...item} key={item.key} />)}
    </ListWrapper>
  );
};
