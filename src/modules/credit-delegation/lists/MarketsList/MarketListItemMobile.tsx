import { Button } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';

import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AtomicaBorrowMarket } from '../../types';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileAssetRow } from '../MobileAssetRow';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';

export const MarketListItemMobile = (market: AtomicaBorrowMarket) => {
  const {
    // amount,
    // amountUsd,
    // requestedAmount,
    // requestedAmountUsd,
    asset,
    title,
    // status,
    // autoApproveWithdrawals,
    apr,
    availableBorrows,
    availableBorrowsInUSD,
  } = market;
  const { openLoanApplication } = useModalContext();
  const { loading } = useCreditDelegationContext();

  return (
    <ListMobileItemWrapper>
      <MobileAssetRow symbol={asset?.symbol ?? 'Unknown'} name={asset?.name ?? 'Unknown'} />
      <MobileFullRow sx={{ fontWeight: 500 }}>{market.id} </MobileFullRow>
      <MobileFullRow sx={{ fontWeight: 500 }}>{title}</MobileFullRow>
      <MobileRow
        left={
          <MobileDataCell
            caption="Interest"
            hintId="Interest"
            value={apr}
            // subValue={requestedAmountUsd}
            left
          />
        }
        right={
          <MobileDataCell
            caption="Available Amount"
            hintId="Available Amount"
            value={availableBorrows}
            subValue={availableBorrowsInUSD}
            right
          />
        }
      />

      <MobileFullRow>
        <Button
          variant="outlined"
          color="secondary"
          disabled={loading}
          onClick={() => openLoanApplication(market)}
        >
          Withdraw
        </Button>
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
