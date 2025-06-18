import { ApproveType, ERC20Service, TokenMetadataType } from '@aave/contract-helpers';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { checkRequiresApproval } from 'src/components/transactions/utils';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCreditDelegationContracts } from 'src/hooks/useCreditDelegationContracts';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { Hex } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useConfig, useSendTransaction } from 'wagmi';

import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { useControllerAddress } from '../../hooks/useControllerAddress';
import { useRiskPool } from '../../hooks/useRiskPool';
import { AtomicaDelegationPool } from '../../types';

export interface CreditDelegationActionProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amount: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  pool?: AtomicaDelegationPool;
  asset?: TokenMetadataType;
  creditDelegationEnabled?: boolean;
}

export const CreditDelegationActions = React.memo(
  ({
    amount,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    poolReserve,
    pool,
    asset,
    creditDelegationEnabled,
    ...props
  }: CreditDelegationActionProps) => {
    const {
      mainTxState,
      loadingTxns,
      setMainTxState,
      setGasLimit,
      setTxError,
      setLoadingTxns,
      setApprovalTxState,
      approvalTxState,
    } = useModalContext();

    const { currentAccount, sendTx, provider } = useWeb3Context();
    const { generateLendTx } = useRiskPool();
    const { controllerAddress: rpcAddress } = useControllerAddress();
    // change source hook
    const { refetchAll, refetchVaults } = useCreditDelegationContext();
    const { generateDeployVault, generateBorrowWithSig } = useCreditDelegationContracts();

    const { sendTransactionAsync } = useSendTransaction();
    const config = useConfig();

    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
    const [approvedAmount, setApprovedAmount] = useState<ApproveType | undefined>();

    const usingCreditDelegation =
      poolReserve.aTokenAddress !== undefined && creditDelegationEnabled;

    // Update gas estimation
    useEffect(() => {
      setGasLimit('40000');
    }, [setGasLimit]);

    const fetchApprovedAmount = useCallback(
      async (forceApprovalCheck?: boolean) => {
        if (usingCreditDelegation) {
          setRequiresApproval(false);
          return;
        }

        if (!pool?.id || !rpcAddress || !currentAccount || !asset?.address || !provider) return;
        if (!approvedAmount || forceApprovalCheck) {
          setLoadingTxns(true);
          const erc20Service = new ERC20Service(provider);

          const currentApprovedAmount = await erc20Service.approvedAmount({
            spender: rpcAddress,
            token: asset.address || '',
            user: currentAccount,
          });

          setApprovedAmount({
            amount: currentApprovedAmount.toString(),
            spender: rpcAddress,
            user: currentAccount,
            token: asset.address || '',
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
        rpcAddress,
        usingCreditDelegation,
        pool?.id,
        asset,
        approvedAmount,
        setLoadingTxns,
        provider,
        currentAccount,
        amount,
        setApprovalTxState,
      ]
    );

    useEffect(() => {
      fetchApprovedAmount();
    }, [fetchApprovedAmount]);

    const deployVault = useCallback(async () => {
      if (pool?.id && pool?.operator) {
        try {
          const deployVaultTxData = await generateDeployVault({
            variableDebtTokenAddress: poolReserve.variableDebtTokenAddress,
            atomicaPoolOperator: pool.operator,
            atomicaPool: pool.id,
            value: parseUnits(amount, decimals).toString(),
            delegationPercentage: 100,
          });

          setMainTxState({ ...mainTxState, loading: true });

          const hash = await sendTransactionAsync({
            data: deployVaultTxData.data as Hex,
            to: deployVaultTxData.to as Hex,
            account: deployVaultTxData.from as Hex,
            value: BigInt(0),
          });

          const receipt = await waitForTransactionReceipt(config.getClient(), {
            hash,
            confirmations: 4,
          });

          await refetchVaults(Number(receipt.blockNumber));

          setMainTxState({
            txHash: hash,
            loading: false,
            success: true,
          });
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);

          console.error(error);
          setTxError(parsedError);
          setMainTxState({
            txHash: undefined,
            loading: false,
          });
        }
      }
    }, [
      poolReserve,
      pool?.id,
      generateDeployVault,
      amount,
      decimals,
      setMainTxState,
      mainTxState,
      sendTransactionAsync,
      config,
      refetchVaults,
      setTxError,
    ]);

    const borrowWithSig = useCallback(async () => {
      if (pool?.id) {
        try {
          const borrowWithTxData = await generateBorrowWithSig({
            variableDebtTokenAddress: poolReserve.variableDebtTokenAddress,
            amount: parseUnits(amount, decimals).toString(),
            vaultAddress: pool.vault?.vault || '',
          });

          setMainTxState({ ...mainTxState, loading: true });

          const hash = await sendTransactionAsync({
            data: borrowWithTxData.data as Hex,
            to: borrowWithTxData.to as Hex,
            account: borrowWithTxData.from as Hex,
            value: BigInt(0),
          });

          const receipt = await waitForTransactionReceipt(config.getClient(), {
            hash,
            confirmations: 4,
          });

          await refetchVaults(Number(receipt.blockNumber));

          setMainTxState({
            txHash: hash,
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
      }
    }, [
      poolReserve,
      pool?.id,
      pool?.vault?.vault,
      generateBorrowWithSig,
      amount,
      decimals,
      setMainTxState,
      mainTxState,
      sendTransactionAsync,
      config,
      refetchVaults,
      setTxError,
    ]);

    const approval = async () => {
      try {
        if (!pool?.id || !rpcAddress || !provider) return;
        const erc20Service = new ERC20Service(provider);

        const approveTxData = erc20Service.approveTxData({
          user: currentAccount,
          amount: parseUnits(amount, asset?.decimals || 18).toString(),
          spender: rpcAddress,
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

    const lendDirectlyToPool = useCallback(async () => {
      if (pool?.id) {
        try {
          const lendDirectlyTx = generateLendTx({
            poolId: pool?.id,
            amount: parseUnits(amount, decimals).toString(),
          });

          setMainTxState({ ...mainTxState, loading: true });

          const response = await sendTx(lendDirectlyTx);

          const receipt = await response.wait(4);
          await refetchAll(receipt.blockNumber);

          setMainTxState({
            txHash: response.hash,
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
      }
    }, [
      amount,
      decimals,
      generateLendTx,
      mainTxState,
      pool?.id,
      sendTx,
      setMainTxState,
      setTxError,
    ]);

    const action = useCallback(async () => {
      if (usingCreditDelegation) {
        if (pool?.vault === undefined) {
          await deployVault();
        } else {
          await borrowWithSig();
        }
      } else {
        lendDirectlyToPool();
      }
    }, [usingCreditDelegation, pool?.vault, deployVault, borrowWithSig, lendDirectlyToPool]);

    return (
      <TxActionsWrapper
        blocked={blocked || amount === '0'}
        mainTxState={mainTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount={pool?.vault !== undefined}
        amount={amount}
        symbol={symbol}
        preparingTransactions={loadingTxns}
        actionText={
          <>
            {pool?.vault === undefined && usingCreditDelegation
              ? 'Deploy vault to delegate credit'
              : `Lend ${symbol}`}
          </>
        }
        actionInProgressText={
          <>
            {pool?.vault === undefined && usingCreditDelegation
              ? 'Deploying vault...'
              : `Lending ${symbol}...`}
          </>
        }
        handleAction={action}
        sx={sx}
        delegate={usingCreditDelegation}
        requiresApproval={requiresApproval}
        handleApproval={approval}
        approvalTxState={approvalTxState}
        {...props}
      />
    );
  }
);
