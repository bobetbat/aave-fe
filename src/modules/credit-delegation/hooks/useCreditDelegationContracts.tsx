import { ERC20Service } from '@aave/contract-helpers';
import { readContract } from '@wagmi/core';
import { PopulatedTransaction } from 'ethers';
import { Interface, splitSignature } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
// import { useConfig } from 'src/modules/credit-delegation/config/ConfigContext';
import { Hex } from 'viem';
import { useConfig as useWagmiConfig, useSignTypedData } from 'wagmi';
import { SignTypedDataVariables } from 'wagmi/query';

import VAULT_ABI from '../abi/CreditDelegationVault.json';
import FACTORY_ABI from '../abi/CreditDelegationVaultFactory.json';
import STABLE_DEBT_TOKEN_ABI from '../abi/StabeDebtTokenABI.json';

type DelegationSignatureParams = {
  debtToken: string;
  value: string;
  deadline: number;
  delegatee: string;
  nonce: number;
};

export interface UseCreditDelegationContracts {}

export const useCreditDelegationContracts = () => {
  const { signTypedDataAsync } = useSignTypedData();
  const { currentAccount, chainId, provider } = useWeb3Context();
  const config = useWagmiConfig();
  // const { vaultFactoryAddress } = useConfig();
  const { secondaryMarket: { vaultFactoryAddress } = {} } = useRootStore(
    (store) => store.currentMarketData
  );

  const getUserDebtTokenNonce = useCallback(
    async (debtToken: string): Promise<string | undefined> => {
      if (currentAccount) {
        const queryData = await readContract(config, {
          address: debtToken as Hex,
          abi: STABLE_DEBT_TOKEN_ABI,
          functionName: 'nonces',
          args: [currentAccount],
        });

        return queryData?.toString();
      }
      return undefined;
    },
    [currentAccount, config]
  );

  const generateDelegationSignatureRequest = useCallback(
    async ({
      debtToken,
      value,
      deadline,
      delegatee,
      nonce,
    }: DelegationSignatureParams): Promise<SignTypedDataVariables | undefined> => {
      // const provider = get().jsonRpcProvider();
      try {
        if (!provider) throw new Error('Provider undefined');
        const tokenERC20Service = new ERC20Service(provider);
        const { name } = await tokenERC20Service.getTokenData(debtToken);

        const typeData = {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            DelegationWithSig: [
              { name: 'delegatee', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'nonce', type: 'uint256' },
              { name: 'deadline', type: 'uint256' },
            ],
          },
          primaryType: 'DelegationWithSig',
          domain: {
            name,
            version: '1',
            chainId,
            verifyingContract: debtToken as Hex,
          },
          message: {
            delegatee,
            value,
            nonce,
            deadline,
          },
        };

        return typeData;
      } catch {
        return undefined;
      }
    },
    [chainId, provider]
  );

  const getVaultAddress = useCallback(async () => {
    if (currentAccount && vaultFactoryAddress) {
      return readContract(config, {
        address: vaultFactoryAddress as Hex,
        abi: FACTORY_ABI,
        functionName: 'predictVaultAddress',
        args: [currentAccount],
      });
    }

    return undefined;
  }, [currentAccount, config, vaultFactoryAddress]);

  const generateDeployVault = useCallback(
    async ({
      atomicaPool,
      atomicaPoolOperator,
      variableDebtTokenAddress,
      value,
      delegationPercentage = 0,
    }: {
      atomicaPoolOperator: string;
      variableDebtTokenAddress: string;
      atomicaPool: string;
      value: string;
      delegationPercentage?: number;
    }) => {
      if (!variableDebtTokenAddress) throw new Error('variableDebtTokenAddress not found');
      if (!currentAccount) throw new Error('currentAccount not found');
      if (!vaultFactoryAddress) throw new Error('vaultFactoryAddress not found');

      const nonce = await getUserDebtTokenNonce(variableDebtTokenAddress);

      const deadline = Date.now() + 1000 * 60 * 50;

      const vaultAddress = await getVaultAddress();

      const dataToSign = await generateDelegationSignatureRequest({
        debtToken: variableDebtTokenAddress.toLowerCase(),
        delegatee: (vaultAddress as Hex).toLowerCase(),
        value,
        deadline: deadline,
        nonce: Number(nonce),
      });

      if (!dataToSign) throw new Error('dataToSign not found');
      const sig = await signTypedDataAsync(dataToSign);

      const { v, r, s } = splitSignature(sig);

      const jsonInterface = new Interface(FACTORY_ABI);

      const txData = jsonInterface.encodeFunctionData('deployVault', [
        atomicaPoolOperator,
        atomicaPool,
        variableDebtTokenAddress,
        value,
        deadline,
        v,
        r,
        s,
        (delegationPercentage * 100).toString(),
        '2',
      ]);

      const deployVaultTx: PopulatedTransaction = {
        data: txData,
        to: vaultFactoryAddress,
        from: currentAccount,
      };

      return deployVaultTx;
    },
    [
      currentAccount,
      getUserDebtTokenNonce,
      getVaultAddress,
      generateDelegationSignatureRequest,
      signTypedDataAsync,
      vaultFactoryAddress,
    ]
  );

  const generateBorrowWithSig = useCallback(
    async ({
      variableDebtTokenAddress,
      amount,
      vaultAddress,
    }: {
      variableDebtTokenAddress: string;
      amount: string;
      vaultAddress: string;
    }) => {
      if (variableDebtTokenAddress && currentAccount) {
        const nonce = await getUserDebtTokenNonce(variableDebtTokenAddress);

        const deadline = Date.now() + 1000 * 60 * 50;

        const dataToSign = await generateDelegationSignatureRequest({
          debtToken: variableDebtTokenAddress.toLowerCase(),
          delegatee: vaultAddress.toLowerCase(),
          value: amount,
          deadline: deadline,
          nonce: Number(nonce),
        });
        if (!dataToSign) throw new Error('dataToSign not found');

        const sig = await signTypedDataAsync(dataToSign);

        const { v, r, s } = splitSignature(sig);

        const jsonInterface = new Interface(VAULT_ABI);

        const txData = jsonInterface.encodeFunctionData('borrowWithSig', [
          amount,
          deadline,
          v,
          r,
          s,
        ]);

        const borrowWithSigTx: PopulatedTransaction = {
          data: txData,
          to: vaultAddress,
          from: currentAccount,
        };

        return borrowWithSigTx;
      }

      throw new Error('Pool not found');
    },
    [currentAccount, generateDelegationSignatureRequest, getUserDebtTokenNonce, signTypedDataAsync]
  );

  return { generateBorrowWithSig, generateDeployVault };
};
