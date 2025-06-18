import { ApproveType, ERC20Service } from '@aave/contract-helpers';
import { useCallback, useEffect, useState } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export const useAllowance = (
  tokenAddress: string,
  spenderAddress: string,
  ownerAddress?: string
) => {
  const { setLoadingTxns } = useModalContext();
  const { currentAccount, provider } = useWeb3Context();

  const account = ownerAddress || currentAccount;

  const [allowance, setAllowance] = useState<ApproveType | undefined>();

  const fetchApprovedAmount = useCallback(
    async (forceApprovalCheck?: boolean) => {
      if ((!allowance || forceApprovalCheck) && provider) {
        setLoadingTxns(true);
        const erc20Service = new ERC20Service(provider);
        const currentApprovedAmount = await erc20Service.approvedAmount({
          spender: spenderAddress,
          token: tokenAddress,
          user: account,
        });

        setAllowance({
          amount: currentApprovedAmount.toString(),
          spender: spenderAddress,
          user: currentAccount,
          token: tokenAddress,
        });
      }

      setLoadingTxns(false);
    },
    [account, allowance, currentAccount, provider, setLoadingTxns, spenderAddress, tokenAddress]
  );

  useEffect(() => {
    fetchApprovedAmount();
  }, [fetchApprovedAmount]);

  const refetch = useCallback(() => {
    fetchApprovedAmount(true);
  }, [fetchApprovedAmount]);

  return {
    allowance,
    refetch,
  };
};
