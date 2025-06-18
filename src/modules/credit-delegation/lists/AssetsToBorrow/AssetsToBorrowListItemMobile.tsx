import { Button } from '@mui/material';
import { useCallback } from 'react';

import { Tabs, useCreditDelegationContext } from '../../CreditDelegationContext';
import { AssetToBorrow } from '../../types';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileAssetRow } from '../MobileAssetRow';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';

export const AssetsToBorrowListItemMobile = ({
  asset,
  // minApr,
  // maxApr,
  available,
  availableUsd,
}: AssetToBorrow) => {
  const { setActiveTab } = useCreditDelegationContext();

  const handleNavigate = useCallback(() => {
    setActiveTab(Tabs.BORROW);
  }, [setActiveTab]);

  return (
    <ListMobileItemWrapper>
      <MobileAssetRow
        symbol={asset.symbol}
        name={asset?.name ?? ''}
        // right={
        //   <Box sx={{ display: 'flex', alignItems: 'center' }}>
        //     <IncentivesCard value={minApr.toString()} symbol={asset.symbol} data-cy={`apyType`} />
        //     <Typography
        //       sx={{
        //         whiteSpace: 'break-spaces',
        //         letterSpacing: 'unset',
        //       }}
        //     >
        //       {'  '}-{'  '}
        //     </Typography>
        //     <IncentivesCard value={maxApr.toString()} symbol={asset.symbol} data-cy={`apyType`} />
        //   </Box>
        // }
      />

      <MobileRow
        left={
          <MobileDataCell
            caption="Available"
            value={Number(available)}
            subValue={Number(availableUsd)}
            hintId="Available"
            left
          />
        }
      />

      <MobileFullRow>
        <Button variant="contained" onClick={handleNavigate}>
          Open a Credit Line
        </Button>
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
