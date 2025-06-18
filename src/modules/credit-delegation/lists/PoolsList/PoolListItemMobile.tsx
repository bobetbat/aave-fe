import { Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { ROUTES } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';

import { SheetPoolStatus } from '../../hooks/usePoolSheetConfig';
import { AtomicaDelegationPool } from '../../types';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileAssetRow } from '../MobileAssetRow';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';

export const PoolListItemMobile = ({
  symbol,
  name,
  isActive,
  underlyingAsset,
  poolLabel,
  id,
  totalApy,
  balances,
  capacityFormatted,
  capacityInUsd,
  status,
  poolBalance,
  capitalRequirementFormatted,
}: AtomicaDelegationPool) => {
  const { openCreditDelegation } = useModalContext();
  const router = useRouter();

  const incentives = balances?.rewardCurrentEarnings?.map((earning) => {
    return {
      incentiveAPR: earning.apy?.div(1000).toString(10) || '0',
      rewardTokenSymbol: earning.symbol,
      rewardTokenAddress: earning.id,
      endedAt: earning.formattedEndedAt,
      usdValue: earning.usdValue,
    };
  });
  // todo: rm poolBalance and change soldOut logic
  const soldOut = poolBalance === capacityFormatted;

  return (
    <ListMobileItemWrapper>
      <MobileAssetRow
        symbol={symbol}
        name={name}
        right={<IncentivesCard value={Number(totalApy)} symbol={symbol} incentives={incentives} />}
      />
      <MobileFullRow sx={{ fontWeight: 500 }}>{poolLabel}</MobileFullRow>

      <MobileRow
        left={
          <MobileDataCell
            caption="Pool Balance"
            value={Number(capacityFormatted || '')}
            subValue={Number(capacityInUsd || '')}
            hintId="Pool Balance"
            left
          />
        }
        right={
          <MobileDataCell
            caption="Pool Capacity"
            value={
              Number(capitalRequirementFormatted) !== 0 ? capitalRequirementFormatted : 'UNLIMITED'
            }
            subValue={capitalRequirementFormatted}
            hintId="Pool Capacity"
            right
          />
        }
      />

      {(status === SheetPoolStatus.SOLD_OUT || SheetPoolStatus.REPAID) && (
        <MobileFullRow>
          <Typography variant="secondary14" sx={{ textAlign: 'center', mt: 1 }}>
            {status}
          </Typography>
        </MobileFullRow>
      )}

      <MobileFullRow>
        <Button
          disabled={!isActive}
          variant="outlined"
          color="secondary"
          onClick={() => router.push(ROUTES.poolDetails(id, underlyingAsset))}
        >
          Details
        </Button>
      </MobileFullRow>
      <MobileFullRow>
        <Button
          disabled={!isActive || soldOut}
          variant="contained"
          onClick={() => openCreditDelegation(id, underlyingAsset)}
        >
          Lend
        </Button>
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
