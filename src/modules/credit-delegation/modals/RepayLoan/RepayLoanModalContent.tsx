import { valueToBigNumber } from '@aave/math-utils';
import { Box } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';
import { memo, useMemo, useState } from 'react';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { ModalWrapperProps } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { useModalContext } from 'src/hooks/useModal';

import { useTokensData } from '../../hooks/useTokensData';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { AtomicaLoan } from '../../types';
import { RepayLoanActions } from './RepayLoanActions';

export enum RepayType {
  INTEREST = 'Interest',
  PRINCIPAL = 'Principal',
}

export interface RepayAsset extends Asset {
  balance: string;
  priceInUSD: string;
  decimals: number;
}

interface RepayLoanModalContentProps extends ModalWrapperProps, AtomicaLoan {}

export const RepayLoanModalContent = memo(
  ({ isWrongNetwork, loanId, premiumAsset, ...rest }: RepayLoanModalContentProps) => {
    const { mainTxState: supplyTxState, txError } = useModalContext();
    const { amount: walletBalance } = useWalletBalance(rest.market?.asset?.address);

    const [_amount, setAmount] = useState('');

    // const interestAccrued = useMemo(
    //   () => calcAccruedInterest(chunks, nowTimestamp),
    //   [chunks, nowTimestamp]
    // );
    // const interestRemaining = BigNumber.max(
    //   interestAccrued.minus(interestRepaid).decimalPlaces(premiumAsset?.decimals ?? WEI_DECIMALS),
    //   0
    // ).toString();

    // const [repayType] = useState<RepayType>(
    //   String(rest.apiLoan.interestToPay) === '0' ? RepayType.PRINCIPAL : RepayType.INTEREST
    // );

    const maxAmount = BigNumber.min(
      BigNumber(rest.apiLoan.interestToPay).plus(BigNumber(rest.apiLoan.leftToRepay)),
      walletBalance ?? 0
    ).toString();

    const showBalance = BigNumber(rest.apiLoan.interestToPay)
      .plus(BigNumber(rest.apiLoan.leftToRepay))
      .isGreaterThan(new BigNumber(walletBalance ?? 0));

    const isMaxSelected = maxAmount === _amount;
    const amount = isMaxSelected
      ? BigNumber(rest.interestToPayFormatted).plus(BigNumber(rest.leftToRepayFormatted)).toString()
      : _amount;

    const handleChange = (value: string) => {
      if (value === '-1') {
        setAmount(maxAmount);
      } else {
        setAmount(value);
      }
    };

    // const principalAmountAfterRepay = valueToBigNumber(requiredRepayAmount)
    //   .minus(amount || '0')
    //   .toString();

    // const interestAmountAfterRepay = valueToBigNumber(rest.apiLoan.interestToPay)
    //   .minus(amount || '0')
    //   .toString();

    const { data: tokenData } = useTokensData(
      useMemo(
        () => (premiumAsset?.address ? [premiumAsset.address] : undefined),
        [premiumAsset?.address]
      )
    );

    const premiumAssetData = tokenData?.[0];

    const usdValue = valueToBigNumber(amount).multipliedBy(premiumAssetData?.priceInUsd ?? 0);

    // const principalAmountAfterRepayInUsd = amountToUsd(
    //   principalAmountAfterRepay,
    //   premiumAssetData?.priceInUsd ?? '0',
    //   marketReferencePriceInUsd
    // );

    // const interestAmountAfterRepayInUsd = amountToUsd(
    //   interestAmountAfterRepay,
    //   premiumAssetData?.priceInUsd ?? '0',
    //   marketReferencePriceInUsd
    // );

    // const requiredRepayAmountUsd = amountToUsd(
    //   requiredRepayAmount,
    //   premiumAssetData?.priceInUsd ?? '0',
    //   marketReferencePriceInUsd
    // );
    // const interestRemainingUsd = amountToUsd(
    //   interestRemaining,
    //   premiumAssetData?.priceInUsd ?? '0',
    //   marketReferencePriceInUsd
    // );

    const actionProps = {
      loanId: rest.apiLoan.loanId,
      amount,
      isWrongNetwork,
      asset: rest.market?.asset,
      // repayType,
      outflowProcessor: rest.market?.outflowProcessor,
    };

    return (
      <>
        <Box sx={{ pt: 5 }}>
          <AssetInput
            value={amount}
            onChange={handleChange}
            usdValue={usdValue.toString(10)}
            symbol={rest.market?.asset?.symbol || ''}
            assets={[
              {
                balance: formatUnits(
                  new BigNumber(maxAmount).toFixed(0),
                  rest.market?.asset?.decimals
                ),
                symbol: rest.market?.asset?.symbol || '',
                iconSymbol: rest.market?.asset?.symbol || '',
              },
            ]}
            disabled={supplyTxState.loading}
            maxValue={maxAmount}
            balanceText={showBalance ? 'Wallet balance' : 'Left to repay'}
            isMaxSelected={isMaxSelected}
          />
        </Box>

        {/* <TxModalDetails gasLimit={gasLimit}>
          <DetailsNumberLineWithSub
            description="Remaining principal debt"
            futureValue={principalAmountAfterRepay}
            futureValueUSD={principalAmountAfterRepayInUsd.toString(10)}
            value={requiredRepayAmount}
            valueUSD={requiredRepayAmountUsd.toString()}
            symbol={premiumAsset?.symbol || ''}
          />
          <DetailsNumberLineWithSub
            description="Remaining interest debt"
            futureValue={interestAmountAfterRepay}
            futureValueUSD={interestAmountAfterRepayInUsd.toString(10)}
            value={rest.apiLoan.interestToPay}
            valueUSD={rest.interestToPayFormatted}
            symbol={premiumAsset?.symbol || ''}
          />
        </TxModalDetails> */}

        {txError && <GasEstimationError txError={txError} />}

        <RepayLoanActions {...actionProps} />
      </>
    );
  }
);
