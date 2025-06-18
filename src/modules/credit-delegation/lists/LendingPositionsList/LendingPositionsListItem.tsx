// import { WEI_DECIMALS } from '@aave/math-utils';
import { Button } from '@mui/material';
// import { BigNumber } from 'bignumber.js';
import { useRouter } from 'next/router';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ROUTES } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';

// import { useTickingReward } from '../../hooks/useTickingReward';
import { AtomicaDelegationPool } from '../../types';
// import { calcAccruedInterest } from '../../utils';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

interface LendingPositionsListItemProps {
  poolVault: AtomicaDelegationPool;
}

export const LendingPositionsListItem = ({
  poolVault,
}: // loanPositions,
LendingPositionsListItemProps) => {
  const { openManageVault } = useModalContext();

  const {
    symbol,
    iconSymbol,
    name,
    // supplyAPY,
    underlyingAsset,
    // metadata,
    id,
    totalApy,
    balances,
  } = poolVault;

  const router = useRouter();

  // const { earnedRewards } = useTickingReward({ rewards: balances?.rewardCurrentEarnings });

  // const { reserve } = user?.userReservesData.find((userReserve) => {
  //   return underlyingAsset === userReserve.underlyingAsset;
  // }) as ComputedUserReserveData;

  // const normalizedAvailableWithdrawUSD = valueToBigNumber(userAvailableWithdraw).multipliedBy(
  //   reserve.priceInUSD
  // );

  const incentives = balances?.rewardCurrentEarnings?.map((earning) => {
    return {
      incentiveAPR: earning.apy?.div(1000).toString(10) || '0',
      rewardTokenSymbol: earning.symbol,
      rewardTokenAddress: earning.id,
      endedAt: earning.formattedEndedAt,
      usdValue: earning.usdValue,
    };
  });

  // const nowTimestamp = Math.floor(Date.now() / 1000);

  // const { interestRemainingUsd, requiredRepayAmountUsd } = useMemo(() => {
  //   let interestRemainingUsd = new BigNumber(0);
  //   let requiredRepayAmountUsd = 0;

  //   loanPositions.forEach(({ loan }) => {
  //     const interestAccrued = calcAccruedInterest(loan.chunks, nowTimestamp).decimalPlaces(
  //       asset?.decimals ?? WEI_DECIMALS
  //     );

  //     const interestAccruedUsd = interestAccrued.times(loan.usdRate);

  //     interestRemainingUsd = interestRemainingUsd.plus(
  //       BigNumber.max(Number(interestAccruedUsd) - Number(loan.interestRepaidUsd), 0)
  //     );

  //     requiredRepayAmountUsd += Number(loan.requiredRepayAmountUsd);
  //   });

  //   return { interestRemainingUsd, requiredRepayAmountUsd };
  // }, [asset?.decimals, loanPositions, nowTimestamp]);

  // const rewardsSum = useMemo(
  //   () =>
  //     [...earnedRewards.values()].reduce((acc, earning) => {
  //       return acc + earning.valueUsd;
  //     }, 0) || 0,
  //   [earnedRewards]
  // );

  // const unclaimedEarnings = useMemo(
  //   () => (rewardsSum + (balances?.totalInterest || 0)).toFixed(6),
  //   [balances?.totalInterest, rewardsSum]
  // );

  // const myBalance = useMemo(
  //   () =>
  //     Number(interestRemainingUsd) +
  //     requiredRepayAmountUsd +
  //     Number(unclaimedEarnings) +
  //     Number(balances?.capitalUsd || 0),
  //   [balances?.capitalUsd, interestRemainingUsd, requiredRepayAmountUsd, unclaimedEarnings]
  // );

  return (
    <ListItemWrapper symbol={symbol} iconSymbol={iconSymbol} name={name}>
      <ListColumn minWidth={70}>{poolVault?.poolLabel}</ListColumn>

      <ListValueColumn
        value={poolVault?.balance ?? '0'}
        symbol={symbol}
        subValue={poolVault?.balanceInUsd ?? '0'}
        withTooltip
        disabled={poolVault?.balance === undefined}
      />

      {/* <ListRewardColumn earnings={incentives} value={rewardsSum + (balances?.totalInterest || 0)} /> */}

      {/* <ListColumn>${unclaimedEarnings}</ListColumn> */}

      <ListAPRColumn
        value={Number(totalApy)}
        symbol={symbol}
        incentives={incentives}
        supplyAPY={totalApy}
      />

      <ListButtonsColumn>
        <Button variant="contained" onClick={() => openManageVault(id)}>
          Withdraw
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push(ROUTES.poolDetails(id, underlyingAsset))}
        >
          Details
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
