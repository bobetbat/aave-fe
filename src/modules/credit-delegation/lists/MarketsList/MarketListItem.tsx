import { Box, Button } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { useModalContext } from 'src/hooks/useModal';
import { CREDIT_DELEGATION_LIST_COLUMN_WIDTHS } from 'src/utils/creditDelegationSortUtils';

import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AtomicaBorrowMarket } from '../../types';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const MarketListItem = (market: AtomicaBorrowMarket) => {
  const { asset, title, apr } = market;
  const { openLoanApplication } = useModalContext();
  const { loading } = useCreditDelegationContext();

  return (
    <ListItemWrapper
      symbol={asset?.symbol ?? 'Any'}
      iconSymbol={asset?.symbol ?? 'default'}
      name={asset?.name ?? 'Any'}
    >
      <ListColumn>{market.marketId}</ListColumn>
      <ListColumn>{title}</ListColumn>

      <ListAPRColumn symbol={asset?.symbol ?? 'default'} value={apr} />
      <ListValueColumn
        symbol={asset?.symbol}
        value={market.availableBorrows}
        subValue={market.availableBorrowsInUSD}
        disabled={Number(market.availableBorrows) === 0}
      />
      <ListColumn maxWidth={CREDIT_DELEGATION_LIST_COLUMN_WIDTHS.BUTTONS}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            '.MuiButton-root': {
              ml: '6px',
            },
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            disabled={loading}
            onClick={() => openLoanApplication(market)}
          >
            Withdraw
          </Button>
        </Box>
      </ListColumn>
    </ListItemWrapper>
  );
};
