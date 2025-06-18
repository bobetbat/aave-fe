import { BoxProps } from '@mui/material';
import { ErrorObject } from 'ajv';
import { parseUnits } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { useConfig } from '../../config/ConfigContext';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { useRiskPool } from '../../hooks/useRiskPool';
import { getValidationFunction } from './validation';

export interface LoanApplicationActionProps extends BoxProps {
  values: {
    name: string;
    phone: string;
    email: string;
    // farmland: string;
    amount: string;
    minAmount: string;
    // repaymentDuration: string;
    // collateral: string[];
    // additionalInfo: string;
    asset: string;
    assetDecimals: number;
    marketId: number;
  };
  setValidationErrors: (errors: ErrorObject<string, Record<string, unknown>, unknown>[]) => void;
  clearForm: () => void;
}

export const LoanApplicationActions = React.memo(({ ...props }: LoanApplicationActionProps) => {
  const { productIds, chainName } = useConfig();

  const {
    values: {
      name,
      phone,
      email,
      amount,
      // farmland,
      // collateral,
      minAmount,
      // repaymentDuration,
      asset,
      assetDecimals,
      marketId,
    },
    setValidationErrors,
    clearForm,
    ...rest
  } = props;
  const { currentAccount, connectWallet, sendTx } = useWeb3Context();
  const { mainTxState, loadingTxns, setGasLimit, setMainTxState, setTxError } = useModalContext();
  const { originator, refetchAll } = useCreditDelegationContext();
  // const { generateRequestLoanTx } = useRiskPool();
  const { generateApplyForPolicyTx } = useRiskPool();
  const validate = useMemo(() => getValidationFunction(), []);

  // Update gas estimation
  useEffect(() => {
    setGasLimit('40000');
  }, [setGasLimit]);

  const action = useCallback(async () => {
    if (loadingTxns) {
      return;
    }

    if (!currentAccount) {
      connectWallet();
      return;
    }

    const valid = validate({ ...props.values, amount: amount || '0' });

    if (!valid) {
      setValidationErrors(validate.errors ?? []);
      return;
    }

    setValidationErrors([]);
    setMainTxState({
      ...mainTxState,
      loading: true,
    });
    try {
      const applyForPolicyTxData = generateApplyForPolicyTx(
        String(marketId),
        parseUnits(amount, assetDecimals)
      );

      const txResponse = await sendTx(applyForPolicyTxData);
      const receipt = await txResponse.wait(4);
      console.log('receipt', receipt);
      const applicationData = {
        'Policy ID': '',
        Market: marketId,
        'Borrower name': name,
        'Borrower phone': phone,
        'Borrower email': email,
        // 'Borrower farmland': farmland,
        Product: (productIds ?? []).join(','),
        'Capital Token Address': asset,
        'Desired loan amount': amount,
        'Min amount': minAmount,
        // 'Repayment duration': repaymentDuration,
        Network: chainName,
        // Collateral: collateral.join(','),
        ...(currentAccount && { 'Wallet Address': currentAccount }),
        ...(originator &&
          originator.toLowerCase() !== currentAccount.toLowerCase() && { Originator: originator }),
      };

      const response = await fetch('/api/loan-application/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit loan application');
      }

      // clearForm();
      await refetchAll();
      setMainTxState({
        ...mainTxState,
        loading: false,
        // success: true,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  }, [currentAccount, name, phone, email, amount, minAmount, asset, marketId, mainTxState]);

  return (
    <TxActionsWrapper
      isWrongNetwork={false}
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      actionText={currentAccount ? 'Apply for a loan' : 'Connect wallet'}
      actionInProgressText={currentAccount ? 'Submitting application' : 'Connecting wallet'}
      handleAction={action}
      requiresApproval={false}
      delegate
      {...rest}
    />
  );
});
