import { WEI_DECIMALS } from '@aave/math-utils';
import { Box } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { memo, useRef, useState } from 'react';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { ModalWrapperProps } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import { useModalContext } from 'src/hooks/useModal';

import { AtomicaLoan } from '../../types';
import { ApproveLoanActions } from './ApproveLoanActions';

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

export const ApproveLoanModalContent = memo(
  ({ isWrongNetwork, loanRequestId, ...rest }: RepayLoanModalContentProps) => {
    const maxAmount = formatUnits(rest.amount, rest.market?.asset?.decimals ?? WEI_DECIMALS);
    const { mainTxState, txError } = useModalContext();
    const [_amount, setAmount] = useState(maxAmount.toString());
    const amountRef = useRef<string>();
    const isMaxSelected = _amount === '-1';
    const amount = isMaxSelected ? maxAmount : _amount;

    const handleChange = (value: string) => {
      const maxSelected = value === '-1';
      amountRef.current = maxSelected ? rest.leftToRepayFormatted : value;
      setAmount(value);
    };
    const amountInUsd = String(Number(rest.market?.asset?.priceInUsd ?? 0) * Number(amount));
    const actionProps = {
      loanId: rest.id?.split('-')[1] ?? '',
      amount,
      isWrongNetwork,
      asset: rest.market?.asset,
      outflowProcessor: rest.market?.outflowProcessor,
    };
    if (mainTxState.success) {
      return (
        <TxSuccessView
          action="Approved"
          amount={amount}
          symbol={rest.market?.asset?.symbol || ''}
        />
      );
    }

    return (
      <>
        <Box sx={{ pt: 5 }}>
          <AssetInput
            value={amount}
            onChange={handleChange}
            usdValue={amountInUsd}
            symbol={rest.market?.asset?.symbol || ''}
            assets={[
              {
                symbol: rest.market?.asset?.address || '',
                iconSymbol: rest.market?.asset?.symbol || '',
              },
            ]}
            disabled={mainTxState.loading}
            maxValue={maxAmount}
            balanceText="Wallet balance"
            isMaxSelected={isMaxSelected}
            // hideMaxButton
          />
        </Box>

        {txError && <GasEstimationError txError={txError} />}

        <ApproveLoanActions {...actionProps} />
      </>
    );
  }
);
