import { Box, Divider } from '@mui/material';
import { ErrorObject } from 'ajv';
import { compact, uniqBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { CommonInput } from 'src/components/transactions/CommonInput';
import { ModalWrapperProps } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useConfig } from '../../config/ConfigContext';
import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AtomicaBorrowMarket } from '../../types';
import { getErrorMessage } from '../../utils';
import { LoanWithdrawalActions } from '../LoanWithdrawal/LoanWithdrawalActions';
import { ModalRow } from '../ModalRow';
import { LoanApplicationActions } from './LoanApplicationActions';
import { SuccessView } from './Success';

// export const collateralOptions = [
//   'Farm Real-estate (i.e. Land)',
//   'Non-farm Real Estate (i.e. house, apartment)',
//   'Farm Vehicles, Machinery & Equipment (tractor etc)',
//   'Non-farm Vehicles, Machinery & Equipment (automobile, truck etc)',
//   'Future Outputs (i.e. future crop for next crop season)',
//   'Investments (i.e. assets held in brokerage accounts, private or public stocks and interests in equity or debt of companies)',
//   'Personal guarantee',
//   '3rd Party Personal or Business Guarantee',
//   'Account Receivables (invoices to your business customers)',
//   'Other Assets (i.e. Inventory, Non-Perishable Goods, Gasoline, Crypto Assets such as BTC, ETH, LNDX token, etc)',
// ];

export enum ErrorType {
  CAP_REACHED,
}

interface LoanApplicationModalContentProps extends ModalWrapperProps {
  // asset?: {
  //   symbol: string;
  //   address: string;
  // };
  market?: AtomicaBorrowMarket;
}

export const LoanApplicationModalContent = React.memo(
  ({ isWrongNetwork, market }: LoanApplicationModalContentProps) => {
    const { defaultCapitalToken } = useConfig();
    const { markets, myPolicies } = useCreditDelegationContext();
    const borrowableAssets = useMemo(
      () => compact(uniqBy(markets.map((market) => market.asset).sort(), 'address')),
      [markets]
    );
    const { currentAccount } = useWeb3Context();

    const { mainTxState } = useModalContext();

    const [selectedAsset, selectAsset] = useState<string>(
      market?.asset?.address ?? defaultCapitalToken
    );
    const [email, setEmail] = useState('');
    const [selectedMarket, setSelectedMarket] = useState(market?.marketId);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    // const [farmland, setFarmland] = useState('');
    // const [additionalInfo, setAdditionalInfo] = useState('');
    const [amount, setAmount] = useState('');
    const [minAmount, setMinAmount] = useState('');
    // const [repaymentDuration, setRepaymentDuration] = useState<string>('');
    // const [collateral, setCollateral] = useState<string[]>([]);

    const assetData = borrowableAssets.find(
      (a) => a.address?.toLowerCase() === selectedAsset.toLowerCase()
    );

    const [validationErrors, setValidationErrors] = useState<
      ErrorObject<string, Record<string, unknown>, unknown>[]
    >([]);

    const policy = useMemo(
      () =>
        myPolicies.filter(
          (currentCreditLine) =>
            market &&
            currentCreditLine?.marketId === market.marketId &&
            currentCreditLine?.owner === currentAccount
        )?.[0] ?? undefined,
      [myPolicies, market?.marketId, currentAccount]
    );

    const clearForm = () => {
      setName('');
      setPhone('');
      setEmail('');
      // setFarmland('');
      // setAdditionalInfo('');
      setMinAmount('0.00');
      setAmount('');
      // setRepaymentDuration('');
      // setCollateral([]);
      setSelectedMarket('');
    };

    const handleSelectAsset = (asset: { symbol: string }) => {
      selectAsset(
        borrowableAssets.find((a) => a.symbol === asset.symbol)?.address ?? defaultCapitalToken
      );
    };

    if (mainTxState.success)
      return (
        <SuccessView
          text="You application has been submitted successfully."
          // subText="Our team will review your application and get back to you within 24 hours."
        />
      );

    const loanWithdrawalProps = {
      amount,
      // recipient: currentAccount, //account
      // company,
      // title,
      // signature,
      blocked: !policy,
      creditLine: policy, // policy
      isWrongNetwork,
      date: new Date().toLocaleDateString(),
      symbol: market?.asset?.symbol ?? 'default',
      clearForm,
      setValidationErrors,
      sx: {
        mt: 4,
      },
    };

    return (
      <>
        <ModalRow>
          <Box>
            <AssetInput
              assets={
                market?.asset === undefined
                  ? (borrowableAssets as Asset[])
                  : ([assetData] as Asset[])
              }
              value={amount}
              onChange={setAmount}
              error={getErrorMessage(validationErrors, 'amount')}
              disabled={mainTxState.loading}
              usdValue={amount}
              symbol={assetData?.symbol ?? ''}
              inputTitle="Desired Loan amount*"
              placeholder="0"
              onSelect={handleSelectAsset}
              hideMaxButton
            />
          </Box>
          <Box>
            <CommonInput
              value={minAmount}
              onChange={setMinAmount}
              label="Min amount to receive"
              fullWidth
              error={getErrorMessage(validationErrors, 'minAmount')}
              disabled={mainTxState.loading}
              placeholder="0.00"
              number
            />
          </Box>
        </ModalRow>
        {/* {!creditLine && <ModalRow>
          <Box>
            <CommonSelect
              type="select"
              label="Market*"
              fullWidth
              error={getErrorMessage(validationErrors, 'selectedMarket')}
              disabled={mainTxState.loading}
              placeholder="Select duration"
              value={selectedMarket}
              onChange={setSelectedMarket}
            >
              {markets.map((market) => (
                <MenuItem key={market.id} value={market.marketId}>
                  {market.title}
                </MenuItem>
              ))}
            </CommonSelect>
          </Box>
        </ModalRow>} */}
        {/* <ModalRow>
          <Box>
            <CommonSelect
              type="select"
              label="Repayment duration*"
              fullWidth
              error={getErrorMessage(validationErrors, 'repaymentDuration')}
              disabled={mainTxState.loading}
              placeholder="Select duration"
              value={repaymentDuration}
              onChange={setRepaymentDuration}
            >
              <MenuItem value="1 month">1 month</MenuItem>
              <MenuItem value="3 months">3 months</MenuItem>
              <MenuItem value="6 months">6 months</MenuItem>
              <MenuItem value="1 year">1 year</MenuItem>
              <MenuItem value="2 years">2 years</MenuItem>
              <MenuItem value="3 years">3 years</MenuItem>
            </CommonSelect>
          </Box>
        </ModalRow> */}
        {/* <ModalRow>
          <MultiSelect
            label="Select collateral*"
            options={collateralOptions.map((option) => ({ value: option, label: option }))}
            value={collateral}
            onChange={setCollateral}
            error={getErrorMessage(validationErrors, 'collateral')}
            loading={mainTxState.loading}
            disabled={mainTxState.loading}
            disableInput={mainTxState.loading}
            fullWidth
            placeholder="Farm Real-estate (i.e. Land)"
            createable
          />
        </ModalRow> */}

        <Divider sx={{ my: 6, mx: -6 }} />

        {!policy && (
          <ModalRow>
            <Box>
              <CommonInput
                value={name}
                onChange={setName}
                label="Full Name*"
                fullWidth
                error={getErrorMessage(validationErrors, 'name')}
                disabled={mainTxState.loading}
                placeholder="Enter your name"
              />
            </Box>
          </ModalRow>
        )}

        {!policy && (
          <ModalRow>
            <Box>
              <CommonInput
                value={phone}
                onChange={setPhone}
                label="Phone*"
                fullWidth
                error={getErrorMessage(validationErrors, 'phone')}
                disabled={mainTxState.loading}
                placeholder="Enter your phone number"
              />
            </Box>
          </ModalRow>
        )}

        {!policy && (
          <ModalRow>
            <Box>
              <CommonInput
                value={email}
                onChange={setEmail}
                label="Email*"
                fullWidth
                error={getErrorMessage(validationErrors, 'email')}
                disabled={mainTxState.loading}
                placeholder="Enter your email address"
              />
            </Box>
          </ModalRow>
        )}

        {!policy && <Divider sx={{ my: 6, mx: -6 }} />}
        {!policy && (
          <LoanApplicationActions
            values={{
              name,
              phone,
              email,
              amount,
              // farmland,
              // additionalInfo,
              // collateral,
              minAmount: minAmount ?? '0.00',
              // repaymentDuration,
              asset: selectedAsset,
              marketId: Number(selectedMarket ?? 0),
              assetDecimals: assetData?.decimals ?? 18,
            }}
            setValidationErrors={setValidationErrors}
            clearForm={clearForm}
            sx={{
              mt: 0,
            }}
          />
        )}
        <LoanWithdrawalActions {...loanWithdrawalProps} />
      </>
    );
  }
);
