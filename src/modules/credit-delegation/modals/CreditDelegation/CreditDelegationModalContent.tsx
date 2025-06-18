import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Box, Checkbox, FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { AssetInput } from 'src/components/transactions/AssetInput';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { ModalWrapperProps } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
// import { useAppDataContext } from 'src/hooks/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { roundToTokenDecimals } from 'src/utils/utils';

// import { useConfig } from '../../config/ConfigContext';
import { WEI_DECIMALS } from '../../consts';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { useLendingCapacity } from '../../hooks/useLendingCapacity';
import { useTokensData } from '../../hooks/useTokensData';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { CreditDelegationActions } from './CreditDelegationActions';

export enum ErrorType {
  CAP_REACHED,
}

interface CreditDelegationModalContentProps extends ModalWrapperProps {
  poolId: string;
}

export const CreditDelegationModalContent = React.memo(
  ({ poolId, underlyingAsset, poolReserve, isWrongNetwork }: CreditDelegationModalContentProps) => {
    // const { baseAssetSymbol } = useConfig();
    const { baseAssetSymbol } = useRootStore((store) => store.currentNetworkConfig);

    const { marketReferencePriceInUsd, user } = useAppDataContext();
    const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
    const { pools } = useCreditDelegationContext();
    const pool = pools.find((p) => p.id === poolId);
    const { lendingCapacity } = useLendingCapacity(pools);

    // states
    const [amount, setAmount] = useState('0');
    const [creditDelegationEnabled, setCreditDelegationEnabled] = useState(false);
    const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

    const usingCreditDelegation =
      poolReserve.aTokenAddress !== undefined && creditDelegationEnabled;

    const concreteAsset = usingCreditDelegation ? underlyingAsset : pool?.atomicaAsset ?? '';

    const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

    const { data: assets } = useTokensData(useMemo(() => [concreteAsset], [concreteAsset]));

    const { amount: walletBalance } = useWalletBalance(concreteAsset);

    const remainingPoolCap =
      pool?.capitalRequirement && pool.capitalRequirement !== '0'
        ? new BigNumber(pool.capitalRequirementFormatted).minus(new BigNumber(pool.balance))
        : new BigNumber(Infinity);

    const maxAAVEAmount = BigNumber.min(remainingPoolCap, lendingCapacity).toFixed();

    const maxAmountToSupply = usingCreditDelegation
      ? maxAAVEAmount
      : walletBalance
      ? BigNumber.min(remainingPoolCap, walletBalance).toFixed()
      : '0';

    const handleChange = useCallback(
      (value: string) => {
        if (value === '-1') {
          setAmount(new BigNumber(maxAmountToSupply).toFixed());
        } else {
          const decimalTruncatedValue = roundToTokenDecimals(
            value,
            pool?.capitalToken?.decimals ?? WEI_DECIMALS
          );
          setAmount(decimalTruncatedValue);
        }
      },
      [pool?.capitalToken?.decimals, setAmount, maxAmountToSupply]
    );

    const handleSwitchCreditDelegation = useCallback(
      (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const maxAmount = checked ? maxAAVEAmount : walletBalance;

        if (Number(amount) > Number(maxAmount ?? 0)) {
          setAmount(maxAmount ?? '0');
        }

        setCreditDelegationEnabled(checked);
      },
      [maxAAVEAmount, amount, walletBalance]
    );

    // Calculation of future HF
    const amountIntEth = new BigNumber(amount).multipliedBy(
      poolReserve?.formattedPriceInMarketReferenceCurrency ?? '1'
    );
    // TODO: is it correct to ut to -1 if user doesnt exist?
    const amountInUsd = amountIntEth
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);

    const isMaxSelected = amount === maxAmountToSupply;

    const lendActionsProps = {
      amount,
      isWrongNetwork,
      poolAddress: supplyUnWrapped ? API_ETH_MOCK_ADDRESS : underlyingAsset,
      symbol: supplyUnWrapped ? baseAssetSymbol : assets?.[0]?.symbol ?? '',
      blocked: false,
      decimals: pool?.capitalToken?.decimals ?? 18,
      poolReserve,
      pool,
      asset: assets?.[0],
      creditDelegationEnabled,
    };

    if (supplyTxState.success)
      return (
        <TxSuccessView
          action="lent"
          amount={amount}
          symbol={supplyUnWrapped ? baseAssetSymbol : assets?.[0]?.symbol ?? ''}
        />
      );

    // health factor calculations
    const amountToBorrowInUsd = valueToBigNumber(amount)
      .multipliedBy(poolReserve?.formattedPriceInMarketReferenceCurrency ?? '1')
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);

    const newHealthFactor = usingCreditDelegation
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
          borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
            amountToBorrowInUsd
          ),
          currentLiquidationThreshold: user.currentLiquidationThreshold,
        })
      : new BigNumber(-1);

    const displayRiskCheckbox =
      newHealthFactor.toNumber() < 1.5 && newHealthFactor.toString() !== '-1';
    console.log('poolReserve', poolReserve);
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            mb: 4,
          }}
        >
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch checked={creditDelegationEnabled} onChange={handleSwitchCreditDelegation} />
              }
              label="Use AAVE credit delegation"
            />
          </FormGroup>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography color="text.secondary">
            This transaction will{' '}
            {usingCreditDelegation ? "use AAVE's credit delegation (variable rate) to " : ''}
            deposit into the pool <b>({pool?.poolLabel ?? pool?.name})</b> and in exchange you will
            receive pool tokens.
          </Typography>
        </Box>

        <Box sx={{ pt: 5 }}>
          <AssetInput
            value={amount}
            onChange={handleChange}
            usdValue={amountInUsd.toString(10)}
            symbol={supplyUnWrapped ? baseAssetSymbol : assets?.[0]?.symbol ?? ''}
            assets={[
              {
                balance: maxAmountToSupply,
                symbol: supplyUnWrapped ? baseAssetSymbol : assets?.[0]?.symbol ?? '',
                iconSymbol: supplyUnWrapped ? baseAssetSymbol : assets?.[0]?.iconSymbol,
              },
            ]}
            isMaxSelected={isMaxSelected}
            disabled={supplyTxState.loading}
            maxValue={maxAmountToSupply}
            balanceText={usingCreditDelegation ? 'Available Aave credit' : 'Balance'}
          />
        </Box>

        <TxModalDetails gasLimit={gasLimit}>
          <DetailsIncentivesLine
            incentives={poolReserve?.vIncentivesData}
            symbol={assets?.[0]?.symbol ?? ''}
          />
          <DetailsNumberLine
            description="Pool APY"
            value={pool?.totalApy ? Number(pool?.totalApy) : '0.0'}
            percent
          />
          {usingCreditDelegation && (
            <DetailsHFLine
              visibleHfChange={!!amount}
              healthFactor={user?.healthFactor ?? '0'}
              futureHealthFactor={newHealthFactor.toString(10)}
            />
          )}
        </TxModalDetails>

        {txError && <GasEstimationError txError={txError} />}

        {displayRiskCheckbox && (
          <>
            <Warning severity="error" sx={{ my: 6 }}>
              Borrowing this amount will reduce your health factor and increase risk of liquidation.
            </Warning>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                mx: '24px',
                mb: '12px',
              }}
            >
              <Checkbox
                checked={riskCheckboxAccepted}
                onChange={() => setRiskCheckboxAccepted(!riskCheckboxAccepted)}
                size="small"
                data-cy={'risk-checkbox'}
              />
              <Typography variant="description">I acknowledge the risks involved.</Typography>
            </Box>
          </>
        )}

        {usingCreditDelegation && (
          <Warning severity="info" sx={{ my: 6 }}>
            <b>Attention:</b> Parameter changes via governance can alter your account health factor
            and risk of liquidation. Follow the{' '}
            <a href="https://governance.aave.com/">Aave governance forum</a> for updates.
          </Warning>
        )}

        <CreditDelegationActions
          {...lendActionsProps}
          blocked={displayRiskCheckbox && !riskCheckboxAccepted}
        />
      </>
    );
  }
);
