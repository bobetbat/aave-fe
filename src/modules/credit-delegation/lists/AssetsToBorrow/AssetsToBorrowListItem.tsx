import { Button } from '@mui/material';
import { useCallback } from 'react';
import { ColumnConfig } from 'src/components/lists/ListHeader';

import { Tabs, useCreditDelegationContext } from '../../CreditDelegationContext';
import { AssetToBorrow } from '../../types';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const AssetsToBorrowListItem = ({
  asset,
  // minApr,
  // maxApr,
  available,
  availableUsd,
}: // full = false,
// columns,
AssetToBorrow & {
  full?: boolean;
  columns?: ColumnConfig[];
}) => {
  const { setActiveTab } = useCreditDelegationContext();

  const handleNavigate = useCallback(() => {
    setActiveTab(Tabs.BORROW);
  }, [setActiveTab]);

  return (
    <ListItemWrapper
      symbol={asset.symbol}
      iconSymbol={asset.symbol}
      name={asset?.name ?? ''}
      data-cy={`assetsToBorrowListItem_${asset.symbol.toUpperCase()}`}
    >
      <ListValueColumn
        symbol={asset.symbol}
        value={Number(available)}
        subValue={Number(availableUsd)}
        disabled={Number(available) === 0}
        withTooltip
      />

      <ListButtonsColumn>
        <Button variant="contained" onClick={handleNavigate}>
          Open a Credit Line
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
