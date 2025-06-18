import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ColumnConfig } from 'src/components/lists/ListHeader';
import { ROUTES } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';

import { useEnvSheetConfig } from '../../hooks/useEnvSheetConfig';
import { AtomicaDelegationPool } from '../../types';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListCapColumn } from '../ListCapColumn';
import { ListCapitalRequirementColumn } from '../ListCapitalRequirementColumn';
import { ListItemWrapper } from '../ListItemWrapper';
// import { ListValueColumn } from '../ListValueColumn';

export const PoolListItem = ({
  symbol,
  iconSymbol,
  name,
  isActive,
  underlyingAsset,
  id,
  totalApy,
  balances,
  columns,
  capacityFormatted,
  capacityInUsd,
  capacity,
  // poolBalanceUsd,
  poolBalance,
  status,
  poolLabel,
  capitalRequirementFormatted,
}: AtomicaDelegationPool & {
  columns: ColumnConfig[];
}) => {
  const { openCreditDelegation } = useModalContext();
  const envConfig = useEnvSheetConfig();
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
  const soldOut = poolBalance === capacityFormatted;

  return (
    <ListItemWrapper symbol={symbol} iconSymbol={iconSymbol} name={name}>
      <ListColumn minWidth={columns[1]?.basis}>{poolLabel}</ListColumn>

      <ListCapColumn
        // symbol={symbol}
        value={Number(capacity || '')}
        capacity={Number(capacityFormatted || '')}
        // subValue={Number(capacityFormatted || '')}
        subCapacity={Number(capacityInUsd || '')}
        withTooltip
        disabled={Number(capacityFormatted) === 0}
        status={status}
        contactUrl={envConfig?.contactUrl}
      />
      <ListCapitalRequirementColumn
        symbol={symbol}
        value={Number(capitalRequirementFormatted ?? '0')}
        // subValue={Number(capitalRequirementInUsd ?? '0')}
        withTooltip
        status={status}
      />

      <ListAPRColumn value={Number(totalApy)} incentives={incentives} symbol={symbol} />

      <ListButtonsColumn>
        <Button
          disabled={!isActive || soldOut}
          variant="contained"
          onClick={() => openCreditDelegation(id, underlyingAsset)}
        >
          Lend
        </Button>
        <Button
          disabled={!isActive}
          variant="outlined"
          color="secondary"
          onClick={() => router.push(ROUTES.poolDetails(id, underlyingAsset))}
        >
          Details
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
