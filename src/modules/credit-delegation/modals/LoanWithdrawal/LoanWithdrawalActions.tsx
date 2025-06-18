import { TransactionReceipt } from '@ethersproject/providers';
import { BoxProps } from '@mui/material';
import { ErrorObject } from 'ajv';
import { parseUnits } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { v4 } from 'uuid';

import { useConfig } from '../../config/ConfigContext';
import { Tabs, useCreditDelegationContext } from '../../CreditDelegationContext';
import { useRiskPool } from '../../hooks/useRiskPool';
import { useTokensData } from '../../hooks/useTokensData';
import { AtomicaSubgraphPolicy } from '../../types';
import { validate } from './validation';

export interface LoanWithdrawalActionProps extends BoxProps {
  amount: string;
  date: string;
  // signature: string;
  // company: string;
  // title: string;
  creditLine: AtomicaSubgraphPolicy;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
  setValidationErrors: (errors: ErrorObject<string, Record<string, unknown>, unknown>[]) => void;
  clearForm: () => void;
}

export const LoanWithdrawalActions = React.memo(
  ({
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    // recipient,
    // company,
    // title,
    amount,
    date,
    // signature,
    creditLine,
    clearForm,
    setValidationErrors,
    ...props
  }: LoanWithdrawalActionProps) => {
    const { mainTxState, loadingTxns, setGasLimit, setMainTxState, setTxError } = useModalContext();
    const { provider, sendTx, currentAccount } = useWeb3Context();
    const { refetchAll, loading, setActiveTab, refetchLoans } = useCreditDelegationContext();
    const { generateRequestLoanTx, generateChangePolicyCoverTx } = useRiskPool();
    const { loanTriggerListId } = useConfig();
    const { data: assets } = useTokensData(
      useMemo(() => [creditLine?.market?.capitalToken], [creditLine?.market?.capitalToken])
    );

    useEffect(() => {
      setGasLimit('40000');
    }, [setGasLimit]);

    const requestLoan = useCallback(async () => {
      try {
        if (!provider) {
          throw new Error('Wallet not connected');
        }
        if (!creditLine) {
          throw new Error('No policy found');
        }

        const requestLoanTx = generateRequestLoanTx(
          creditLine.market?.outflowProcessor as string,
          creditLine.policyId,
          parseUnits(amount, assets?.[0].decimals).toString(),
          parseUnits(amount, assets?.[0].decimals).toString(),
          '31709791984', // == max 100% APR interest fee
          String(loanTriggerListId),
          currentAccount,
          ''
        );

        const tx = await sendTx(requestLoanTx);
        const receipt: TransactionReceipt = await tx.wait();

        await refetchAll(receipt.blockNumber);

        setMainTxState({
          txHash: receipt.transactionHash,
          loading: false,
          success: true,
        });

        setActiveTab(Tabs.PORTFOLIO);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
      }
    }, [
      creditLine,
      loanTriggerListId,
      provider,
      currentAccount,
      // creditLine?.id,
      assets?.[0].decimals,
      creditLine?.policyId,
      creditLine?.market,
      clearForm,
      refetchLoans,
      setActiveTab,
      amount,
      setMainTxState,
      refetchAll,
      setTxError,
    ]);

    const handleChangePolicyCover = useCallback(async () => {
      try {
        const changePolicyCoverTx = generateChangePolicyCoverTx(
          creditLine.policyId,
          parseUnits(amount, assets?.[0]?.decimals).toString()
        );

        const tx = await sendTx(changePolicyCoverTx);
        await tx.wait();
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
      }
    }, [
      assets?.[0]?.decimals,
      creditLine?.policyId,
      generateChangePolicyCoverTx,
      amount,
      setTxError,
    ]);

    const action = useCallback(async () => {
      if (loadingTxns) return;
      const valid = validate({ amount, currentAccount });
      if (!valid) {
        setValidationErrors(validate.errors ?? []);
        return;
      }

      setValidationErrors([]);
      setMainTxState({ txHash: undefined, loading: true });

      try {
        if (parseUnits(amount, assets?.[0]?.decimals).gte(creditLine.balance)) {
          await handleChangePolicyCover();
        }

        await requestLoan();

        const response = await fetch('/api/withdrawal/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              Name: name,
              Amount: amount,
              Date: date,
              'Policy ID': creditLine.policyId,
              'Receiver Address': currentAccount,
              'Loan ID': creditLine.id,
              'Withdraw ID': v4(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add withdrawal entry');
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({ txHash: undefined, loading: false });
      }
    }, [amount, loadingTxns, creditLine, currentAccount, handleChangePolicyCover, requestLoan]);

    return (
      <TxActionsWrapper
        blocked={blocked || loading}
        mainTxState={mainTxState}
        isWrongNetwork={isWrongNetwork}
        amount={amount}
        symbol={symbol}
        preparingTransactions={loadingTxns}
        actionText="Request Loan"
        actionInProgressText="Requesting..."
        handleAction={action}
        requiresApproval={false}
        sx={sx}
        delegate
        {...props}
      />
    );
  }
);
