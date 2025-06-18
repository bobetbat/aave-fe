// import { WEI_DECIMALS } from '@aave/math-utils';
import { Button } from '@mui/material';
// import { BigNumber } from 'bignumber.js';
import { useRouter } from 'next/router';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { ROUTES } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';

// import { useTickingReward } from '../../hooks/useTickingReward';
import { AtomicaDelegationPool } from '../../types';
// import { calcAccruedInterest } from '../../utils';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileAssetRow } from '../MobileAssetRow';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';

interface LendingPositionsListItemMobileProps {
  poolVault: AtomicaDelegationPool;
}

export const LendingPositionsListItemMobile = ({
  poolVault,
}: // loanPositions,
LendingPositionsListItemMobileProps) => {
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
    balance,
    balanceInUsd,
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
  //   () => Number(interestRemainingUsd) + requiredRepayAmountUsd + Number(unclaimedEarnings),
  //   [interestRemainingUsd, requiredRepayAmountUsd, unclaimedEarnings]
  // );

  return (
    <ListMobileItemWrapper>
      <MobileAssetRow
        symbol={iconSymbol}
        name={name}
        right={
          <IncentivesCard
            value={Number(totalApy)}
            symbol={symbol}
            incentives={incentives}
            supplyAPY={totalApy}
          />
        }
      />
      <MobileFullRow sx={{ fontWeight: 500 }}>{poolVault?.poolLabel}</MobileFullRow>

      <MobileRow
        left={
          <MobileDataCell
            caption="My Pool Balance"
            hintId="My Pool Balance"
            value={balance ?? '0'}
            subValue={balanceInUsd ?? '0'}
            left
          />
        }
        // right={
        //   <MobileDataCell
        //     caption="Unclaimed Earnings"
        //     hintId="Unclaimed Earnings"
        //     value={unclaimedEarnings}
        //     valueProps={{ symbol: 'USD' }}
        //     right
        //   />
        // }
      />

      <MobileFullRow>
        <Button
          variant="outlined"
          onClick={() => router.push(ROUTES.poolDetails(id, underlyingAsset))}
        >
          Details
        </Button>
      </MobileFullRow>
      <MobileFullRow>
        <Button variant="contained" onClick={() => openManageVault(id)} disabled>
          Withdraw
        </Button>
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
