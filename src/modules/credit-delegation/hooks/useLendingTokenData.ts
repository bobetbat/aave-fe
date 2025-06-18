import { normalize } from '@aave/math-utils';
import type { Abi } from 'abitype';
import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { useReadContracts } from 'wagmi';

// Ensure ABI is typed correctly for wagmi
import LendingOutflowProcessorAdapterAbiJson from '../abi/LendingOutflowProcessorAdapter.json';
import { WEI_DECIMALS } from '../consts';

const LendingOutflowProcessorAdapterAbi = LendingOutflowProcessorAdapterAbiJson as unknown as Abi;

enum LendingTokenInfoPropertyIndex {
  TotalSupply,
  UnpaidInterest,
  RepaidPrincipal,
  PaidInterest,
  TotalBorrowedPrincipal,
  BalanceOf,
  TimelockDuration,
  Timelocks,
}

export interface LendingTokenInfo {
  balanceAmount: BigNumber;
  lendingTokenToAssetTokenRate: BigNumber;
  totalLendingTokenToAssetTokenRate: BigNumber;
  totalAssets: BigNumber;
  totalSupply: BigNumber;
  repaidPrincipal: BigNumber;
  paidInterest: BigNumber;
  unpaidInterest: BigNumber;
  totalBorrowedPrincipal: BigNumber;
  totalCapacity: BigNumber;
  timelockDurationInSec: number;
  poolId: `0x${string}`;
  lendingTokenAddress: `0x${string}`;
}
export interface LendingTokenProps {
  lendingTokenAddress: `0x${string}`;
  poolId: string;
  operatorFee: string;
}
export interface UseLendingTokensDataProps {
  poolData: LendingTokenProps[];
}

export const useLendingTokensData = ({ poolData }: UseLendingTokensDataProps) => {
  const chainId = useRootStore((store) => store.currentChainId);
  const { currentAccount: account } = useWeb3Context();

  // Build contract calls for each token address
  const contractCalls = useMemo(
    () =>
      poolData.flatMap((address) => [
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'totalSupply' as const,
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'unpaidInterest' as const,
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'repaidPrincipal' as const,
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'paidInterest' as const,
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'totalBorrowedPrincipal' as const,
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'balanceOf' as const,
          args: [account ?? ''],
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'timelockDuration' as const,
          chainId: chainId,
        },
        {
          abi: LendingOutflowProcessorAdapterAbi,
          address: address.lendingTokenAddress,
          functionName: 'timelocks' as const,
          args: [account ?? ''],
          chainId: chainId,
        },
      ]),
    [poolData, account, chainId]
  );

  const { data, isSuccess, isLoading, refetch } = useReadContracts({ contracts: contractCalls });

  const lendingTokensInfo = useMemo(() => {
    if (!data) return [];

    const callsPerToken = Object.keys(LendingTokenInfoPropertyIndex).length / 2; // enum has bidirectional keys

    return poolData.map((lendingToken, tokenIndex) => {
      const baseIndex = tokenIndex * callsPerToken;
      const read = (idx: LendingTokenInfoPropertyIndex) =>
        new BigNumber(data[baseIndex + idx]?.result?.toString() || '0');

      const totalSupply = read(LendingTokenInfoPropertyIndex.TotalSupply);
      const unpaidInterestRaw = read(LendingTokenInfoPropertyIndex.UnpaidInterest);
      const repaidPrincipal = read(LendingTokenInfoPropertyIndex.RepaidPrincipal);
      const paidInterestRaw = read(LendingTokenInfoPropertyIndex.PaidInterest);
      const totalBorrowedPrincipal = read(LendingTokenInfoPropertyIndex.TotalBorrowedPrincipal);
      const balanceOf = read(LendingTokenInfoPropertyIndex.BalanceOf);
      const timelockDuration = read(LendingTokenInfoPropertyIndex.TimelockDuration);

      const poolOperatorFeeMul = new BigNumber(1).minus(
        normalize(lendingToken.operatorFee, WEI_DECIMALS)
      );
      const paidInterest = paidInterestRaw.times(poolOperatorFeeMul);
      const unpaidInterest = unpaidInterestRaw.times(poolOperatorFeeMul);

      const totalAssets = totalBorrowedPrincipal
        .plus(repaidPrincipal)
        .plus(paidInterest)
        .plus(unpaidInterest);

      const totalCapacity = repaidPrincipal.plus(paidInterest);
      const totalLendingTokenToAssetTokenRate = totalAssets.plus(1).div(totalSupply.plus(1));
      const lendingTokenToAssetTokenRate = totalCapacity.plus(1).div(totalSupply.plus(1));

      return {
        balanceAmount: balanceOf,
        lendingTokenToAssetTokenRate,
        totalLendingTokenToAssetTokenRate,
        totalAssets,
        totalSupply,
        repaidPrincipal,
        paidInterest,
        unpaidInterest,
        totalBorrowedPrincipal,
        totalCapacity,
        timelockDurationInSec: timelockDuration.toNumber(),
        poolId: lendingToken.poolId,
        lendingTokenAddress: lendingToken.lendingTokenAddress,
      } as LendingTokenInfo;
    });
  }, [data, poolData]);

  return {
    lendingTokensInfo,
    isSuccess,
    isLoading,
    forceReload: refetch,
  };
};
