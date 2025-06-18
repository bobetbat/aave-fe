import { valueToBigNumber } from '@aave/math-utils';
import { useMemo } from 'react';

import { AtomicaLoan, LoanStatus } from '../types';

export const useBorrowed = (loans: AtomicaLoan[]) => {
  const borrowed = useMemo(
    () =>
      loans
        .filter((loan) => loan.status === LoanStatus.Active)
        .reduce(
          (acc, loan) =>
            valueToBigNumber(loan.apiLoan?.borrowedAmountInUsd ?? '0')
              .minus(loan.apiLoan?.repaidPrincipalInUsd ?? '0')
              .plus(acc),
          valueToBigNumber(0)
        )
        .decimalPlaces(2)
        .toString(),
    [loans]
  );

  const apr = useMemo(() => {
    if (Number(borrowed) === 0) return '0';

    return loans
      .filter((loan) => loan.status === LoanStatus.Active)
      .reduce(
        (acc, loan) =>
          valueToBigNumber(loan?.apiLoan?.interestRatePerYear ?? '0')
            .times(
              valueToBigNumber(loan.apiLoan?.borrowedAmountInUsd ?? '0').minus(
                loan.apiLoan?.repaidPrincipalInUsd ?? '0'
              )
            )
            .plus(acc),
        valueToBigNumber(0)
      )
      .dividedBy(borrowed)
      .toString();
  }, [borrowed, loans]);

  const borrowingCapacity = useMemo(
    () =>
      loans
        .filter((creditLine) => creditLine.status === LoanStatus.Active)
        .reduce((acc, loan) => valueToBigNumber(loan.amount ?? '0').plus(acc), valueToBigNumber(0))
        .toString(),
    [loans]
  );

  return { borrowed, apr, borrowingCapacity };
};
