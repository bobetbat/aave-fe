import { normalize } from '@aave/math-utils';
import { Stack, Typography } from '@mui/material';
import { memo, useMemo, useState } from 'react';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { ModalWrapperProps } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import { DetailsNumber } from 'src/components/transactions/FlowCommons/TxModalDetails';
import { useModalContext } from 'src/hooks/useModal';

import { WEI_DECIMALS } from '../../consts';
import { usePoolSheetConfig } from '../../hooks/usePoolSheetConfig';
import { useTokensData } from '../../hooks/useTokensData';
import { AtomicaDelegationPool } from '../../types';
import { ManageVaultModalActions } from './ManageVaultModalActions';

export enum ManageType {
  CLAIM_BASE_INCOME = 'Base Income Withdrawn',
  WITHDRAW_NOT_BORROWED = 'Not borrowed Funds Withdrawn',
  WITHDRAW_REPAID = 'Repaid Funds Withdrawn',
}

interface ManageVaultModalContentProps extends ModalWrapperProps, AtomicaDelegationPool {}

interface ValueWithSymbolProps {
  value: string;
  symbol: string;
}

export const ValueWithSymbol = ({ value, symbol }: ValueWithSymbolProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography variant="h4" color="text.primary">
        {value}
      </Typography>
      <Typography variant="buttonL" color="text.secondary">
        {symbol}
      </Typography>
    </Stack>
  );
};

export const ManageVaultModalContent = memo(
  ({
    id,
    isWrongNetwork,
    balances,
    rewards,
    underlyingAsset,
    balanceInUsd,
    balance,
    capitalTokenRate,
    poolTokenDecimals,
    ...pool
  }: ManageVaultModalContentProps) => {
    const { setMainTxState, mainTxState, txError } = useModalContext();
    const { allowWithdrawals } = usePoolSheetConfig(id) ?? {};
    const { data: assets } = useTokensData(useMemo(() => [underlyingAsset], [underlyingAsset]));
    const [manageType, setManageType] = useState<ManageType>(ManageType.CLAIM_BASE_INCOME);

    const repaidAmount = normalize(
      pool.lendingTokenInfo?.repaidPrincipal.times(pool.poolStats?.share ?? 0),
      pool.capitalToken?.decimals ?? WEI_DECIMALS
    );
    const notRepaidAmount = normalize(
      pool.lendingTokenInfo?.totalBorrowedPrincipal.times(pool.poolStats?.share ?? 0),
      pool.capitalToken?.decimals ?? WEI_DECIMALS
    );
    const repaidAmountInUsd = normalize(
      pool.lendingTokenInfo?.repaidPrincipal
        .times(pool.poolStats?.share ?? 0)
        .times(capitalTokenRate ?? 1),
      pool.capitalToken?.decimals ?? WEI_DECIMALS
    );
    const notRepaidAmountInUsd = normalize(
      pool.lendingTokenInfo?.totalBorrowedPrincipal
        .times(pool.poolStats?.share ?? 0)
        .times(capitalTokenRate ?? 1),
      pool.capitalToken?.decimals ?? WEI_DECIMALS
    );

    const { earnings } = rewards || {};

    const userLpBalance = String(pool.poolStats?.tokenBalance || '0');

    const userCapitalTokenBalance = balances?.capital || '0';

    const actionProps = {
      poolId: id,
      blocked: !allowWithdrawals,
      // blockedClaim: totalInterestSum === 0,
      blockedWithdraw: Number(userCapitalTokenBalance) === 0,
      asset: assets?.[0],
      isWrongNetwork,
      amount: userLpBalance,
      poolTokenDecimals,
      manageType,
      earnedRewardIds:
        rewards?.earnings?.earnings.flatMap((earning) => earning.earnedRewardIds) || [],
      lastReward: earnings?.lastReward,
      totalInterest: balances?.totalInterest || 0,
      capitalTokenRate,
      lendingTokenAddress: pool.lendingTokenInfo?.lendingTokenAddress,
      lendingTokenAmount: pool.lendingTokenInfo?.balanceAmount,
      withdrawDelay: pool.withdrawDelay,
      setManageType,
      repaidAmount,
    };
    const getAomunt = () => {
      switch (manageType) {
        case ManageType.CLAIM_BASE_INCOME:
          return '';
        case ManageType.WITHDRAW_NOT_BORROWED:
          return balance;
        case ManageType.WITHDRAW_REPAID:
          return repaidAmount;
        default:
          return '';
      }
    };
    if (mainTxState.success)
      return (
        <TxSuccessView
          action={manageType}
          amount={getAomunt()}
          symbol={assets?.[0]?.symbol ?? ''}
          onClose={() => setMainTxState({ success: false })}
        />
      );
    return (
      <>
        <DetailsNumber
          title="Not-Yet Borrowed Funds"
          value={Number(balance ?? 0)}
          valueUSD={Number(balanceInUsd ?? 0)}
          symbol={assets?.[0]?.symbol || ''}
        />
        <DetailsNumber
          title="Borrowed and Repaid"
          value={Number(repaidAmount)}
          valueUSD={Number(repaidAmountInUsd)}
          symbol={assets?.[0]?.symbol || ''}
        />
        <DetailsNumber
          title="Sell Not-Yet Repaid Loans"
          value={Number(notRepaidAmount)}
          valueUSD={Number(notRepaidAmountInUsd)}
          symbol={assets?.[0]?.symbol || ''}
        />

        {txError && <GasEstimationError txError={txError} />}

        <ManageVaultModalActions {...actionProps} />
      </>
    );
  }
);
