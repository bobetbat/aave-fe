import { Box, Button, Typography } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';

import { Tabs, useCreditDelegationContext } from '../../CreditDelegationContext';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { AssetToLend } from '../../types';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileAssetRow } from '../MobileAssetRow';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';

export const AssetsToLendListItemMobile = ({ symbol, maxApy, minApy, asset }: AssetToLend) => {
  const { setActiveTab } = useCreditDelegationContext();
  const balance = useWalletBalance(asset?.address);

  return (
    <ListMobileItemWrapper>
      <MobileAssetRow
        symbol={symbol}
        name={asset?.name || 'unknown'}
        right={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IncentivesCard value={minApy.toString()} symbol={symbol} data-cy={`apyType`} />
            <Typography
              sx={{
                whiteSpace: 'break-spaces',
                letterSpacing: 'unset',
              }}
            >
              {'  '}-{'  '}
            </Typography>
            <IncentivesCard value={maxApy.toString()} symbol={symbol} data-cy={`apyType`} />
          </Box>
        }
      />

      <MobileRow
        left={<></>}
        right={
          <MobileDataCell
            caption="My Wallet"
            value={balance.amount || ''}
            subValue={balance.amountUSD || ''}
            hintId="My Wallet"
            right
          />
        }
      />

      <MobileFullRow>
        <Button variant="contained" onClick={() => setActiveTab(Tabs.DELEGATE)}>
          Explore Pools
        </Button>
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
