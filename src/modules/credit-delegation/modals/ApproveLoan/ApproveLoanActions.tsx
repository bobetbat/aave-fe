import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { memo, useCallback, useEffect } from 'react';
import { Asset } from 'src/components/transactions/AssetInput';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
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

export const ApproveLoanActions = memo(
  ({
    loanId,
    amount,
    isWrongNetwork,
    asset,
    sx,
    outflowProcessor,
    ...props
  }: RepayLoanActionProps) => {
    const { mainTxState, loadingTxns, setMainTxState, setGasLimit, setTxError } = useModalContext();
    const { sendTx } = useWeb3Context();
    const { refetchLoans } = useCreditDelegationContext();
    const { generateApproveLoanTx } = useRiskPool();

    useEffect(() => {
      setGasLimit('40000');
    }, [setGasLimit]);

    const approveLoan = useCallback(async () => {
      try {
        if (!outflowProcessor) throw new Error('outflowProcessor missing');
        setMainTxState({ ...mainTxState, loading: true });

        const approveLoanTx = generateApproveLoanTx(
          outflowProcessor,
          loanId,
          parseUnits(amount, asset?.decimals).toString()
        );
        const txResponse = await sendTx(approveLoanTx);
        const receipt = await txResponse.wait(4);

        await refetchLoans(receipt.blockNumber);
        setMainTxState({
          txHash: txResponse.hash,
          loading: false,
          success: true,
        });
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
      setTxError,
    ]);

    return (
      <TxActionsWrapper
        mainTxState={mainTxState}
        isWrongNetwork={isWrongNetwork}
        amount={amount}
        symbol={asset?.symbol || ''}
        preparingTransactions={loadingTxns}
        actionText={`Approve loan`}
        actionInProgressText={`Approving loan...`}
        handleAction={approveLoan}
        requiresApproval={false}
        sx={sx}
        requiresAmount={true}
        {...props}
      />
    );
  }
);
