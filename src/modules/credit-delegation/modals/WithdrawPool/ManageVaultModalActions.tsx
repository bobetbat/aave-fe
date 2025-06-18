import { TokenMetadataType } from '@aave/contract-helpers';
import { BoxProps } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useCreditDelegationContext } from 'src/modules/credit-delegation/CreditDelegationContext';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { useRiskPool } from '../../hooks/useRiskPool';
import { Reward } from '../../types';
import { ManageType } from './ManageVaultModalContent';

interface ManageVaultActionProps extends BoxProps {
  poolId: string;
  amount: string;
  isWrongNetwork: boolean;
  asset?: TokenMetadataType;
  manageType: ManageType;
  earnedRewardIds: string[];
  lastReward?: Reward;
  totalInterest: number;
  blocked?: boolean;
  blockedWithdraw?: boolean;
  blockedClaim?: boolean;
  poolTokenDecimals: number;
  capitalTokenRate: number;
  lendingTokenAddress: string;
  withdrawDelay: string;
  lendingTokenAmount: BigNumber;
  repaidAmount: string;
  setManageType: Dispatch<SetStateAction<ManageType>>;
}

export const ManageVaultModalActions = memo(
  ({
    poolId,
    isWrongNetwork,
    amount,
    asset,
    sx,
    poolTokenDecimals,
    lendingTokenAddress,
    withdrawDelay,
    lendingTokenAmount,
    setManageType,
    repaidAmount,
  }: ManageVaultActionProps) => {
    const { currentAccount } = useWeb3Context();
    const { mainTxState, loadingTxns, setMainTxState, setGasLimit, setTxError } = useModalContext();
    const {
      generateCreateRedeemRequestTx,
      generateApprovalTx,
      generateRedeemTx,
      generateClaimAllBaseIncome,
      generateSellLendingTokensTx,
    } = useRiskPool();

    const { sendTx, provider } = useWeb3Context();
    const { refetchAll } = useCreditDelegationContext();
    const [claimLoading, setClaimLoading] = useState(false);
    const [notBorrowedLoading, setNotBorrowedLoading] = useState(false);
    const [borrowedLoading, setBorrowedLoading] = useState(false);

    useEffect(() => {
      setGasLimit('40000');
    }, [setGasLimit]);

    // withdraw Not-Yet Borrowed Funds
    const withdrawLiquidity = useCallback(async () => {
      if (poolId) {
        try {
          let response;

          setMainTxState({ ...mainTxState });
          setManageType(ManageType.WITHDRAW_NOT_BORROWED);
          setNotBorrowedLoading(true);
          const createRedeemRequestTxData = generateCreateRedeemRequestTx(
            poolId,
            amount.toString(),
            currentAccount
          );

          if (withdrawDelay && Number(withdrawDelay) > 0) {
            response = await sendTx(createRedeemRequestTxData);
            await response.wait(4);
          }

          const approveTxData = generateApprovalTx(poolId, amount.toString(), currentAccount);
          response = await sendTx(approveTxData);
          await response.wait(4);

          const redeemTx = generateRedeemTx(poolId, amount.toString(), currentAccount);
          response = await sendTx(redeemTx);
          const receipt = await response.wait(4);

          await refetchAll(receipt.blockNumber);
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setNotBorrowedLoading(false);
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          console.error(error);
          setTxError(parsedError);
          setMainTxState({
            txHash: undefined,
            loading: false,
          });
          setNotBorrowedLoading(false);
        }
      }
    }, [
      amount,
      poolTokenDecimals,
      provider,
      refetchAll,
      setMainTxState,
      mainTxState,
      generateRedeemTx,
      generateCreateRedeemRequestTx,
      generateApprovalTx,
      poolId,
      sendTx,
      setTxError,
    ]);

    // withdraw Borrowed & Repaid
    const sellLendingTokens = useCallback(async () => {
      if (poolId) {
        try {
          setMainTxState({ ...mainTxState });
          setManageType(ManageType.WITHDRAW_REPAID);
          setBorrowedLoading(true);
          const sellLendingTokensData = generateSellLendingTokensTx(
            lendingTokenAddress, // lendingTokenAddress
            lendingTokenAmount.toString() // lending token amount
          );
          const response = await sendTx(sellLendingTokensData);
          await response.wait(4);

          const receipt = await response.wait(4);

          await refetchAll(receipt.blockNumber);
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setBorrowedLoading(false);
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          console.error(error);
          setTxError(parsedError);
          setMainTxState({
            txHash: undefined,
            loading: false,
          });
          setBorrowedLoading(false);
        }
      }
    }, [
      lendingTokenAmount,
      refetchAll,
      setMainTxState,
      mainTxState,
      generateSellLendingTokensTx,
      poolId,
      sendTx,
      setTxError,
    ]);

    const claimAllBaseIncome = useCallback(async () => {
      try {
        const generateClaimAllBaseIncomeData = generateClaimAllBaseIncome(poolId);
        setMainTxState({ ...mainTxState });
        setClaimLoading(true);
        setManageType(ManageType.CLAIM_BASE_INCOME);

        const response = await sendTx(generateClaimAllBaseIncomeData);
        const receipt = await response.wait(4);

        await refetchAll(receipt.blockNumber);
        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });
        setClaimLoading(false);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        console.error(error);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
        setClaimLoading(false);
      }
    }, [
      asset?.address,
      provider,
      refetchAll,
      generateClaimAllBaseIncome,
      mainTxState,
      sendTx,
      setMainTxState,
      setTxError,
      poolId,
    ]);

    return (
      <>
        <TxActionsWrapper
          mainTxState={mainTxState}
          isWrongNetwork={isWrongNetwork}
          symbol={asset?.symbol || ''}
          preparingTransactions={loadingTxns}
          actionText={'Withdraw Not Borrowed Funds'}
          actionInProgressText={'Withdrawing...'}
          handleAction={withdrawLiquidity}
          requiresApproval={false}
          requiresAmount={true}
          sx={sx}
          loading={notBorrowedLoading}
          // blocked={props.blocked || props.blockedWithdraw || withdrawn}
        />
        <TxActionsWrapper
          mainTxState={mainTxState}
          isWrongNetwork={isWrongNetwork}
          symbol={asset?.symbol || ''}
          preparingTransactions={loadingTxns}
          actionText={'Claim Base Income'}
          actionInProgressText={`Claiming...`}
          handleAction={claimAllBaseIncome}
          requiresApproval={false}
          sx={{ ...sx, mt: 2 }}
          requiresAmount={true}
          loading={claimLoading}
        />
        <TxActionsWrapper
          mainTxState={mainTxState}
          isWrongNetwork={isWrongNetwork}
          symbol={asset?.symbol || ''}
          preparingTransactions={loadingTxns}
          actionText={'Withdraw Borrowed & Repaid Funds'}
          actionInProgressText={'Withdrawing...'}
          handleAction={sellLendingTokens}
          requiresApproval={false}
          sx={{ ...sx, mt: 2 }}
          loading={borrowedLoading}
          requiresAmount={true}
          blocked={
            !lendingTokenAmount || lendingTokenAmount.eq(0) || new BigNumber(repaidAmount).eq(0)
          }
        />
      </>
    );
  }
);
