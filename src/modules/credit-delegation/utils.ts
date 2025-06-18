import { valueToBigNumber } from '@aave/math-utils';
import { ErrorObject } from 'ajv';
import { get, orderBy } from 'lodash';

import {
  AtomicaBorrowMarket,
  AtomicaSubgraphLoanChunk,
  LoanRequestStatus,
  LoanStatus,
} from './types';

const handleSymbolSort = <T extends { symbol: string }>(sortDesc: boolean, pools: T[]) => {
  if (sortDesc) {
    return pools.sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 1));
  }
  return pools.sort((a, b) => (b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 1));
};

export const handleStandardSort = <T>(sortDesc: boolean, sortName: string, items: T[]): T[] => {
  if (sortName === 'symbol') {
    return handleSymbolSort(sortDesc, items as unknown as (T & { symbol: string })[]);
  } else {
    return orderBy(
      items,
      (item: T) => {
        const val = get(item, sortName);

        if (typeof val === 'string') {
          const num = parseFloat(val as string);

          if (isNaN(num)) {
            return val;
          }

          return num;
        }

        return val;
      },
      sortDesc ? 'desc' : 'asc'
    );
  }
};

export const handleSortMarkets = (
  sortDesc: boolean,
  sortName: string,
  markets: AtomicaBorrowMarket[]
): AtomicaBorrowMarket[] => {
  const sorted = handleStandardSort(sortDesc, sortName, markets);

  return sorted.sort((a) => {
    return a.allowed ? -1 : 1;
  });
};

export const convertTimestampToDate = (timestamp: string) =>
  new Intl.DateTimeFormat('en-US').format(new Date(Number(timestamp) * 1000));

export const getRequestStatus = (status: number) => {
  if (status === LoanRequestStatus.Requested) return LoanStatus.Requested;
  if (status === LoanRequestStatus.Approved) return LoanStatus.Pending;
  if (status === LoanRequestStatus.Active) return LoanStatus.Active;
  if (status === LoanRequestStatus.Closed) return LoanStatus.Closed;

  return LoanStatus.Declined;
};

export const calcAccruedInterest = (chunks: AtomicaSubgraphLoanChunk[], timestamp: number) => {
  return chunks.reduce((acc, loanChunk) => {
    const leftToRepay = valueToBigNumber(loanChunk.borrowedAmount).minus(loanChunk.repaidPrincipal);

    const accruedInterest = valueToBigNumber(timestamp)
      .minus(loanChunk.lastUpdateTs)
      .times(leftToRepay)
      .times(loanChunk.rate)
      .plus(loanChunk.accruedInterest);

    return acc.plus(accruedInterest);
  }, valueToBigNumber(0));
};

export const uniq = <T>(arr: T[]) => [...new Set(arr)];

// export const mapLoan = ({
//   loan,
//   market,
//   request,
//   policy,
//   tokenData,
//   reserves,
//   marketReferencePriceInUsd,
//   loanChunks,
// }: {
//   loan?: AtomicaSubgraphLoan;
//   market?: AtomicaBorrowMarket;
//   request: AtomicaSubgraphLoanRequest;
//   policy?: AtomicaSubgraphPolicy;
//   tokenData: TokenDataWithPrice[];
//   reserves: ComputedReserveData[];
//   marketReferencePriceInUsd: string;
//   loanChunks?: AtomicaSubgraphLoanChunk[];
// }): AtomicaLoan => {
//   const asset = tokenData?.find((token) => token.address === policy?.market.capitalToken);

//   const premiumAsset = tokenData?.find((token) => token.address === policy?.market.premiumToken);

//   const reserve = reserves.find((reserve) => {
//     if (asset?.symbol.toLowerCase() === 'eth') return reserve.isWrappedBaseAsset;

//     return reserve.symbol.toLowerCase() === asset?.symbol.toLowerCase();
//   });

//   const borrowedAmount = normalizeBN(
//     loan?.borrowedAmount ?? request?.amount ?? '0',
//     asset?.decimals ?? WEI_DECIMALS
//   );

//   const borrowedAmountUsd = amountToUsd(
//     borrowedAmount,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   );

//   const approvedAmount = normalizeBN(
//     loan?.borrowedAmount ?? request?.approvedAmount ?? '0',
//     asset?.decimals ?? WEI_DECIMALS
//   );

//   const approvedAmountUsd = amountToUsd(
//     approvedAmount,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   );

//   const chunks =
//     loan !== undefined && loanChunks !== undefined
//       ? loanChunks
//           .filter((chunk) => chunk.loanId === loan.id.split('-')[1])
//           .map((chunk) => {
//             return {
//               ...chunk,
//               borrowedAmount: normalize(chunk.borrowedAmount, asset?.decimals ?? WEI_DECIMALS),
//               repaidAmount: normalize(chunk.repaidPrincipal, asset?.decimals ?? WEI_DECIMALS),
//               accruedInterest: normalize(chunk.accruedInterest, asset?.decimals ?? WEI_DECIMALS),
//               rate: normalize(chunk.rate, WEI_DECIMALS),
//             };
//           })
//       : [];

//   const repaidAmount = normalize(
//     chunks.reduce((acc, chunk) => {
//       return acc.plus(valueToBigNumber(chunk.repaidPrincipal));
//     }, valueToBigNumber(0)),
//     asset?.decimals ?? WEI_DECIMALS
//   );

//   const repaidAmountUsd = amountToUsd(
//     repaidAmount,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   );

//   const requiredRepayAmount = borrowedAmount.minus(repaidAmount);
//   const requiredRepayAmountUsd = amountToUsd(
//     requiredRepayAmount,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   );

//   const ratePerSec =
//     loan !== undefined
//       ? chunks.reduce((acc, chunk) => {
//           return acc.plus(
//             valueToBigNumber(chunk.rate).times(
//               valueToBigNumber(chunk.borrowedAmount).div(borrowedAmount)
//             )
//           );
//         }, valueToBigNumber(0))
//       : normalizeBN(request?.maxPremiumRatePerSec ?? '0', WEI_DECIMALS);

//   const apr = ratePerSec.times(TIME_INTERVALS_IN_SEC.year).toNumber();

//   const interestAccrued = calcAccruedInterest(chunks, Math.floor(Date.now() / 1000));

//   const interestAccruedUsd = amountToUsd(
//     interestAccrued,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   ).toString();

//   const interestRepaid = normalize(loan?.interestRepaid ?? '0', asset?.decimals ?? WEI_DECIMALS);

//   const interestRepaidUsd = amountToUsd(
//     interestRepaid,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   ).toString();

//   const interestCharged = loan?.interestCharged ?? '0';

//   const interestChargedUsd = amountToUsd(
//     interestCharged,
//     reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//     marketReferencePriceInUsd
//   ).toString();

//   return {
//     ...request,
//     market,
//     policy,
//     asset,
//     usdRate: amountToUsd(
//       1,
//       reserve?.formattedPriceInMarketReferenceCurrency ?? '1',
//       marketReferencePriceInUsd
//     ).toString(),
//     chunks,
//     borrowedAmount: borrowedAmount.toString(),
//     borrowedAmountUsd: borrowedAmountUsd.toString(),
//     ratePerSec: ratePerSec.toString(),
//     apr,
//     repaidAmount: repaidAmount.toString(),
//     repaidAmountUsd: repaidAmountUsd.toString(),
//     requiredRepayAmount: requiredRepayAmount.toString(),
//     requiredRepayAmountUsd: requiredRepayAmountUsd.toString(),
//     approvedAmount: approvedAmount.toString(),
//     approvedAmountUsd: approvedAmountUsd.toString(),
//     status: loan === undefined ? getRequestStatus(request?.status ?? 0) : LoanStatus.Active,
//     interestAccrued: interestAccrued.toString(),
//     interestAccruedUsd,
//     interestCharged,
//     interestChargedUsd,
//     interestRepaid,
//     interestRepaidUsd,
//     data: loan?.data ?? null,
//     loanRequestId: request?.id,
//     lastUpdateTs: loan?.lastUpdateTs ?? undefined,
//     loanId: loan?.id ?? undefined,
//     createdAt: loan?.createdAt ?? request.createdAt,
//     premiumAsset,
//   };
// };

export const hasError = (
  errors: ErrorObject<string, Record<string, unknown>, unknown>[],
  name: string,
  filter?: Record<string, string>
) => {
  return errors.some((error) => {
    if (filter) {
      return (
        error.instancePath === `/${name}` &&
        Object.keys(filter).every((key) => error.params[key] === filter[key])
      );
    }

    return error.instancePath === `/${name}`;
  });
};

export const getErrorMessage = (
  errors: ErrorObject<string, Record<string, unknown>, unknown>[],
  name: string,
  filter?: Record<string, string>
) => {
  const msg = errors.find((error) => {
    if (filter) {
      return (
        error.instancePath === `/${name}` &&
        Object.keys(filter).every((key) => error.params[key] === filter[key])
      );
    }

    return error.instancePath === `/${name}`;
  })?.message;

  if (msg) {
    return msg.charAt(0).toUpperCase() + msg.slice(1);
  }

  return '';
};
