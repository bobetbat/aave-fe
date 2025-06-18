import { normalize, normalizeBN, WEI_DECIMALS } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { Contract, ethers, PopulatedTransaction } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import LENDING_FACTORY from '../abi/LendingFactory.json';
import LENDING_OUTFLOW_PROCESSOR from '../abi/LendingOutflowProcessor.json';
import LENDING_OUTFLOW_PROCESSOR_ADAPTER from '../abi/LendingOutflowProcessorAdapter.json';
import POOL_V2 from '../abi/PoolV2.json';
import RISK_POOLS_CONTROLLER from '../abi/RiskPoolsController.json';
import { DEFAULT_LOGO, MAX_UINT256, TIME_INTERVALS_IN_SEC } from '../consts';
import {
  AccountPoolReward,
  AtomicaSubgraphRewards,
  EarnedToken,
  PoolEarnings,
  Reward,
  RewardCurrentEarnings,
} from '../types';
import { convertTimestampToDate } from '../utils';
import { useCoinRate } from './useCoinRate';
import { useControllerAddress } from './useControllerAddress';

export type TokenMap = {
  [key: string]: Reward;
};

export const useRiskPool = () => {
  // const { atomicaApiUrl, lendingFactoryAddress } = useConfig();
  const { chainId, secondaryMarket: { atomicaApiUrl, lendingFactoryAddress } = {} } = useRootStore(
    (store) => store.currentMarketData
  );

  const { controllerAddress: rpcAddress } = useControllerAddress();

  const { currentAccount } = useWeb3Context();
  const provider = getProvider(chainId);

  const { getPriceMap, getCoinId } = useCoinRate();

  const rpcInterface = new Interface(RISK_POOLS_CONTROLLER);
  const poolV2Interface = new Interface(POOL_V2);
  const outflowProcessorInterface = new Interface(LENDING_OUTFLOW_PROCESSOR);
  const outflowProcessorAdapterInterface = new Interface(LENDING_OUTFLOW_PROCESSOR_ADAPTER);

  const generateSellLendingTokensTx = (lendingTokenAddress: string, amount: string) => {
    const txData = outflowProcessorAdapterInterface.encodeFunctionData('withdraw', [
      String(amount),
    ]);
    const withdrawLendingTokensTx: PopulatedTransaction = {
      data: txData,
      to: lendingTokenAddress,
      from: currentAccount,
    };

    return withdrawLendingTokensTx;
  };
  const generateLendTx = ({ poolId, amount }: { poolId: string; amount: string }) => {
    const txData = rpcInterface.encodeFunctionData('deposit', [
      poolId,
      String(amount),
      currentAccount,
      '0',
    ]); // minShares=0
    const lendToPoolTx: PopulatedTransaction = {
      data: txData,
      to: rpcAddress,
      from: currentAccount,
    };

    return lendToPoolTx;
  };
  const generateChangePolicyCoverTx = (policyId: string, desiredCover: string) => {
    const txData = rpcInterface.encodeFunctionData('changePolicyCover', [
      policyId,
      String(desiredCover),
      '0', // permissionId
      '0', // depositAmount
    ]);

    const tx: PopulatedTransaction = {
      data: txData,
      to: rpcAddress,
      from: currentAccount,
    };

    return tx;
  };

  const getCurrentlyEarned = (
    rewardRate: BigNumber,
    earned: BigNumber,
    updatedAt: number,
    endedAt: number,
    currentTimestamp: number
  ) => {
    return rewardRate
      .times(Math.min(currentTimestamp, endedAt) - updatedAt)
      .div(100)
      .plus(earned);
  };

  const getLendingTokenAddress = async (poolId: `0x${string}`) => {
    if (!lendingFactoryAddress) throw new Error('Lending factory address not found');

    const contract = new Contract(lendingFactoryAddress, LENDING_FACTORY, provider);
    const lendingTokenAddress: `0x${string}` = await contract.adapters(poolId.toLowerCase());

    return {
      lendingTokenAddress,
      poolId,
    };
  };

  const calculateCurrentlyEarned = (
    earnings: EarnedToken[],
    apys: { apy?: BigNumber; rewardId?: string }[],
    currentTimestamp: number
  ): RewardCurrentEarnings[] => {
    return earnings.map((earning) => {
      const currentlyEarned = getCurrentlyEarned(
        earning.rewardRate || new BigNumber(0),
        earning.earned || new BigNumber(0),
        new BigNumber(Math.floor(earning?.updatedAt || 0 / 1000)).toNumber(),
        earning.endedAt?.toNumber() || 0,
        currentTimestamp
      );

      return {
        ...earning,
        value: currentlyEarned,
        usdValue: Number(normalize(currentlyEarned, earning.decimals)) * earning.price,
        formattedEndedAt: convertTimestampToDate(earning.endedAt.toString()),
        apy: apys?.find((apy) => apy.rewardId === earning.id)?.apy,
      };
    });
  };

  const generateCreateRedeemRequestTx = (
    pool: string,
    poolTokenAmount: string,
    account: string
  ) => {
    const txData = poolV2Interface.encodeFunctionData('createRedeemRequest', [poolTokenAmount]);

    const createRedeemRequestTx: PopulatedTransaction = {
      data: txData,
      to: pool,
      from: account,
    };

    return createRedeemRequestTx;
  };

  // assetTokenAmount?
  const generateWithdrawTx = (pool: string, assetTokenAmount: string, account: string) => {
    const txData = rpcInterface.encodeFunctionData('withdraw', [
      pool,
      assetTokenAmount,
      account,
      account,
      new BigNumber(MAX_UINT256).toFixed(),
    ]);

    const withdrawTx: PopulatedTransaction = {
      data: txData,
      to: rpcAddress,
      from: account,
    };

    return withdrawTx;
  };

  const generateRedeemTx = (pool: string, poolTokenAmount: string, account: string) => {
    const txData = rpcInterface.encodeFunctionData('redeem', [
      pool,
      poolTokenAmount,
      account,
      account,
      0,
    ]);

    const withdrawTx: PopulatedTransaction = {
      data: txData,
      to: rpcAddress,
      from: account,
    };

    return withdrawTx;
  };

  const generateRequestLoanTx = (
    outflowProcessor: string,
    policyId: string,
    amount: string,
    minAmount: string,
    maxRate: string,
    loanTriggerListId: string,
    recipient: string,
    details: string
  ) => {
    const txData = outflowProcessorInterface.encodeFunctionData('requestLoan', [
      policyId,
      amount,
      minAmount,
      maxRate,
      loanTriggerListId,
      recipient,
      details,
    ]);

    const withdrawTx: PopulatedTransaction = {
      data: txData,
      to: outflowProcessor,
      from: currentAccount,
    };

    return withdrawTx;
  };

  const generateApprovalTx = (
    pool: string,
    poolTokenAmount: string,
    account: string
  ): PopulatedTransaction => {
    try {
      if (!poolTokenAmount) {
        throw new Error('You have no LP tokens to approve');
      }
      if (!account) {
        throw new Error('Account not connected');
      }

      const jsonInterface = new Interface([
        'function approve(address spender, uint256 amount) returns (bool)',
      ]);
      const txData = jsonInterface.encodeFunctionData('approve', [rpcAddress, poolTokenAmount]);

      const approvalTx: PopulatedTransaction = {
        data: txData,
        to: pool,
        from: account,
      };

      return approvalTx;
    } catch (err) {
      throw new Error(
        `Failed to generate approval transaction: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }
  };
  const generateApplyForPolicyTx = (
    marketId: string,
    lpBalance: ethers.BigNumber
  ): PopulatedTransaction => {
    try {
      const depositAmount = '0';
      const maxRate = '0';
      const frontendOperator = '0x0000000000000000000000000000000000000000';
      const referral = '0x0000000000000000000000000000000000000000';
      const details = '';

      if (lpBalance.isZero()) {
        throw new Error('You have no LP tokens');
      }
      if (!currentAccount) {
        throw new Error('Account not connected');
      }

      const txData = rpcInterface.encodeFunctionData('applyForPolicy', [
        marketId,
        depositAmount,
        lpBalance,
        maxRate,
        frontendOperator,
        referral,
        currentAccount,
        details,
      ]);

      const applyForPolicyTx: PopulatedTransaction = {
        data: txData,
        to: rpcAddress,
        from: currentAccount,
      };

      return applyForPolicyTx;
    } catch (err) {
      throw new Error(
        `Failed to generate approval transaction: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }
  };

  const generateClaimRewardsTx = (rewardIds: string[], pool: string) => {
    const txData = rpcInterface.encodeFunctionData('claimSelectedRewards', [rewardIds]);

    const claimRewardsTx: PopulatedTransaction = {
      data: txData,
      to: pool,
      from: currentAccount,
    };

    return claimRewardsTx;
  };
  const generateApproveLoanTx = (
    outflowProcessor: string,
    loanRequestId: string,
    amount: string
  ) => {
    const txData = outflowProcessorInterface.encodeFunctionData('approveLoanRequest', [
      loanRequestId,
      amount,
    ]);

    const approveLoanTx: PopulatedTransaction = {
      data: txData,
      to: outflowProcessor,
      from: currentAccount,
    };

    return approveLoanTx;
  };
  const generateRepayLoanTx = (outflowProcessor: string, loanRequestId: string, amount: string) => {
    const txData = outflowProcessorInterface.encodeFunctionData('repay', [loanRequestId, amount]);

    const repayLoanTx: PopulatedTransaction = {
      data: txData,
      to: outflowProcessor,
      from: currentAccount,
    };

    return repayLoanTx;
  };
  const getAccountPoolRewards = async (rewards: AtomicaSubgraphRewards[]) => {
    const url = `${atomicaApiUrl}/v2/pool/earned-reward-list`;
    const items = rewards.map((reward) => {
      return { poolId: reward.poolId || '', chainId, rewardId: reward.num };
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentAccount,
          items,
        }),
      });

      if (response.ok) {
        const updatedAt = Date.now();
        const poolRewards = await response.json();

        return items.map<AccountPoolReward>((item, index) => ({
          ...item,
          reward: poolRewards[index],
          updatedAt,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMostRecentReward = (rewards: TokenMap) => {
    let result: Reward | undefined;
    const now = +new Date() / 1000;

    Object.values(rewards).forEach((reward) => {
      const isInRange =
        new BigNumber(reward.startedAt || 0).lt(now) && new BigNumber(reward.endedAt || 0).gt(now);
      result =
        isInRange && (!result || new BigNumber(result.startedAt || 0).lt(reward.startedAt || 0))
          ? reward
          : result;
    });

    return result;
  };

  const getPoolRewardTokens = async (rewards: AtomicaSubgraphRewards[], atTimestamp: number) => {
    const accountPoolRewards = await getAccountPoolRewards(rewards);

    return rewards.reduce((tokens, reward) => {
      const coinId = getCoinId(reward.rewardTokenName);
      let token: Reward = tokens[coinId];

      const poolReward = (accountPoolRewards || []).find(
        ({ poolId, rewardId }) => poolId === reward.poolId && rewardId === reward.num
      );

      const endedAt = new BigNumber(reward.endedAt || 0);
      const startedAt = new BigNumber(reward.startedAt || 0);
      const ratePerSecond = new BigNumber(reward.ratePerSecond || 0);
      const duration = endedAt.minus(startedAt);

      if (!token) {
        token = {
          id: reward.rewardToken,
          logoURI: DEFAULT_LOGO,
          decimals: reward?.rewardTokenDecimals || '0',
          symbol: reward?.rewardTokenSymbol,
          name: reward?.rewardTokenName,
          amount: new BigNumber(0),
          duration: duration.toNumber(),
          earned: new BigNumber(0),
          rewardRate: new BigNumber(0),
          earnedRewardIds: [],
          endedAt,
          startedAt,
          tokenUsdPrice: 0,
          updatedAt: poolReward?.updatedAt,
        };
      }

      if (endedAt.toNumber() > atTimestamp / 1000 && startedAt.toNumber() <= atTimestamp / 1000) {
        token.amount = token.amount.plus(ratePerSecond.times(duration.toNumber()));
        token.rewardRate = token.rewardRate.plus(ratePerSecond);
      }

      if (poolReward && new BigNumber(poolReward.reward || 0).gt(0)) {
        token.earned = token.earned.plus(poolReward.reward);

        token.earnedRewardIds.push(poolReward.rewardId);
      }

      tokens[coinId] = token;

      return tokens;
    }, <TokenMap>{});
  };

  const convertToEarnings = (tokens: TokenMap) => {
    const earnings = new Array<EarnedToken>();

    Array.from(Object.values(tokens)).forEach((token) => {
      if (token.earned.gt(0)) {
        earnings.push({
          id: token.id,
          logoUrl: token.logoURI,
          rewardRate: token.rewardRate,
          earned: token.earned,
          earnedRewardIds: token.earnedRewardIds,
          decimals: Number(token.decimals) ?? WEI_DECIMALS,
          symbol: token.symbol || '?',
          price: token.tokenUsdPrice || 0,
          endedAt: token.endedAt,
          startedAt: token.startedAt,
          updatedAt: token.updatedAt,
        });
      }
    });

    return earnings;
  };

  const annualRewardSummaryInUsd = (tokens: TokenMap) => {
    let rewardSum = new BigNumber(0);

    const annualRewardPerTokens = Object.values(tokens).map((token) => {
      if (token.tokenUsdPrice) {
        const apy = token.duration
          ? normalizeBN(token.amount, Number(token.decimals))
              .times(token.tokenUsdPrice)
              .div(token.duration)
              .times(TIME_INTERVALS_IN_SEC.year)
          : new BigNumber(0);

        rewardSum = rewardSum.plus(apy);

        return {
          apy,
          rewardId: token.id,
        };
      }
    });

    return {
      rewardSum,
      annualRewardPerTokens,
    };
  };

  const calculateRewards = async (rewards: AtomicaSubgraphRewards[]) => {
    const rewardTokens = await getPoolRewardTokens(rewards, new Date().getTime());

    await getPriceMap(rewardTokens);

    const annualRewardSummary = annualRewardSummaryInUsd(rewardTokens);

    return {
      lastReward: getMostRecentReward(rewardTokens),
      annualRewardSummary,
      earnings: convertToEarnings(rewardTokens),
    };
  };

  const calculatePoolRewards = async (rewards: AtomicaSubgraphRewards[]): Promise<PoolEarnings> => {
    const { earnings, lastReward, annualRewardSummary } = await calculateRewards(rewards);

    return {
      earnings,
      lastReward,
      apys: annualRewardSummary.annualRewardPerTokens.map((rewardApy) => {
        return {
          apy: rewardApy?.apy,
          rewardId: rewardApy?.rewardId,
        };
      }),
      poolId: rewards[0]?.poolId || '',
    };
  };

  const getUserPoolSettlementPremiums = async (contract: Contract, token: string) => {
    const settlementValue = await contract.accumulatedSettlement(currentAccount, token);
    const premiumValue = await contract.accumulatedPremium(currentAccount, token);
    return {
      settlement: settlementValue,
      premium: premiumValue,
    };
  };

  const generateClaimAllBaseIncome = (poolId: string) => {
    const claimAllInflowDropsData = poolV2Interface.encodeFunctionData('claimAllInflowDrops', [
      currentAccount,
      currentAccount,
    ]);

    const claimAllInflowDropsTx: PopulatedTransaction = {
      data: claimAllInflowDropsData,
      to: poolId,
      from: currentAccount,
    };

    return claimAllInflowDropsTx;
  };

  return {
    generateChangePolicyCoverTx,
    generateLendTx,
    generateWithdrawTx,
    calculatePoolRewards,
    generateClaimRewardsTx,
    getUserPoolSettlementPremiums,
    generateApplyForPolicyTx,
    generateApprovalTx,
    generateRedeemTx,
    calculateCurrentlyEarned,
    getCurrentlyEarned,
    generateCreateRedeemRequestTx,
    generateRequestLoanTx,
    generateSellLendingTokensTx,
    getLendingTokenAddress,
    generateClaimAllBaseIncome,
    generateApproveLoanTx,
    generateRepayLoanTx,
  };
};
