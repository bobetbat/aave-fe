import { ApproveType, ERC20Service } from '@aave/contract-helpers';
import { WEI_DECIMALS } from '@aave/math-utils';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { memo, useCallback, useEffect, useState } from 'react';
import { Asset } from 'src/components/transactions/AssetInput';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { checkRequiresApproval } from 'src/components/transactions/utils';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { useRiskPool } from '../../hooks/useRiskPool';

interface RepayLoanActionProps extends BoxProps {
  loanId: string;
  amount: string;
  isWrongNetwork: boolean;
  asset?: Asset;
  outflowProcessor?: string;
}

export const RepayLoanActions = memo(
  ({
    loanId,
    amount,
    isWrongNetwork,
    asset,
    sx,
    outflowProcessor,
    ...props
  }: RepayLoanActionProps) => {
    const {
      mainTxState,
      loadingTxns,
      setMainTxState,
      setGasLimit,
      setTxError,
      close,
      approvalTxState,
      setApprovalTxState,
      setLoadingTxns,
    } = useModalContext();
    const { currentAccount, sendTx, provider } = useWeb3Context();
    const { refetchLoans } = useCreditDelegationContext();
    const { generateRepayLoanTx } = useRiskPool();
    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
    const [approvedAmount, setApprovedAmount] = useState<ApproveType | undefined>();

    useEffect(() => {
      setGasLimit('40000');
    }, [setGasLimit]);

    const fetchApprovedAmount = useCallback(
      async (forceApprovalCheck?: boolean) => {
        if (!outflowProcessor || !provider) return;
        if (!approvedAmount || forceApprovalCheck) {
          setLoadingTxns(true);
          const erc20Service = new ERC20Service(provider);
          const currentApprovedAmount = await erc20Service.approvedAmount({
            spender: outflowProcessor,
            token: asset?.address || '',
            user: currentAccount,
          });

          setApprovedAmount({
            amount: currentApprovedAmount.toString(),
            spender: outflowProcessor,
            user: currentAccount,
            token: asset?.address || '',
          });
        }

        if (approvedAmount) {
          const fetchedRequiresApproval = checkRequiresApproval({
            approvedAmount: approvedAmount.amount,
            amount,
            signedAmount: '0',
          });
          setRequiresApproval(fetchedRequiresApproval);
          if (fetchedRequiresApproval) setApprovalTxState({});
        }

        setLoadingTxns(false);
      },
      [
        approvedAmount,
        setLoadingTxns,
        setApprovalTxState,
        amount,
        asset,
        currentAccount,
        provider,
        outflowProcessor,
      ]
    );

    useEffect(() => {
      fetchApprovedAmount();
    }, [fetchApprovedAmount]);

    const repayLoan = useCallback(async () => {
      try {
        if (!outflowProcessor) return;

        setMainTxState({ ...mainTxState, loading: true });
        const repayLoanTx = generateRepayLoanTx(
          outflowProcessor,
          loanId,
          parseUnits(amount, asset?.decimals ?? WEI_DECIMALS).toString()
        );
        const response = await sendTx(repayLoanTx);
        const receipt = await response.wait(4);

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });

        await refetchLoans(receipt.blockNumber);

        close();
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }, [
      outflowProcessor,
      setMainTxState,
      mainTxState,
      loanId,
      amount,
      asset?.decimals,
      refetchLoans,
      close,
      setTxError,
    ]);

    const approval = async () => {
      try {
        if (!outflowProcessor || !provider) return;
        const erc20Service = new ERC20Service(provider);

        const approveTxData = erc20Service.approveTxData({
          user: currentAccount,
          amount: parseUnits(amount, asset?.decimals ?? 18).toString(),
          spender: outflowProcessor,
          token: asset?.address || '',
        });

        setApprovalTxState({ ...approvalTxState, loading: true });

        const response = await sendTx(approveTxData);
        await response.wait(1);

        setApprovalTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });
        fetchApprovedAmount(true);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    return (
      <TxActionsWrapper
        mainTxState={mainTxState}
        isWrongNetwork={isWrongNetwork}
        amount={amount}
        symbol={asset?.symbol || ''}
        preparingTransactions={loadingTxns}
        actionText={`Repay loan`}
        actionInProgressText={`Repaying loan...`}
        handleAction={repayLoan}
        requiresApproval={requiresApproval}
        handleApproval={() => approval()}
        approvalTxState={approvalTxState}
        sx={sx}
        requiresAmount={true}
        {...props}
      />
    );
  }
);
