import { Button } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';

import { ListAPRRangeColumn } from '../../../../components/lists/ListAPRRangeColumn';
import { Tabs, useCreditDelegationContext } from '../../CreditDelegationContext';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { AssetToLend } from '../../types';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const AssetsToLendListItem = ({ symbol, maxApy, minApy, securedBy, asset }: AssetToLend) => {
  const { setActiveTab } = useCreditDelegationContext();
  const balance = useWalletBalance(asset?.address);

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={symbol}
      name={asset?.name ?? 'Unknown'}
      data-cy={`assetsToLendListItem_${symbol.toUpperCase()}`}
    >
      <ListAPRRangeColumn symbol={symbol} minApr={minApy.toString()} maxApr={maxApy.toString()} />

      <ListColumn>{securedBy}</ListColumn>

      <ListValueColumn
        symbol={symbol}
        value={balance.amount || ''}
        subValue={balance.amountUSD || ''}
        withTooltip
      />
      <ListButtonsColumn>
        <Button variant="contained" onClick={() => setActiveTab(Tabs.DELEGATE)}>
          Explore Pools
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
