import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, SvgIcon, Typography } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { Link } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';

import { AtomicaLoan, LoanStatus } from '../../types';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListRepaidColumn } from './ListRepaidColumn';
import { StatusChip } from './StatusChip';

interface LoanListItemProps extends AtomicaLoan {
  admin?: boolean;
}

export const LoanListItem = ({ admin, ...loan }: LoanListItemProps) => {
  const { openRepayLoan, openApproveLoan } = useModalContext();
  const {
    market,
    status,
    apiLoan,
    borrowedAmountFormatted,
    leftToRepayFormatted,
    repaidPrincipalFormatted,
    totalAccruedInterestFormatted,
    interestToPayFormatted,
    interestPaidFormatted,
  } = loan;

  return (
    <ListItemWrapper
      symbol={market?.asset?.symbol ?? 'Unknown'}
      iconSymbol={market?.asset?.symbol ?? 'default'}
      name={market?.asset?.name ?? 'Unknown'}
    >
      <ListColumn>
        {loan.policyId}/{loan.id.split('-')[1] ?? 'N'}/{loan?.apiLoan?.loanId ?? 'N'}
      </ListColumn>
      <ListColumn>
        {market?.product.title}: {market?.title}
      </ListColumn>
      <ListRepaidColumn
        original={borrowedAmountFormatted}
        originalUsd={apiLoan?.borrowedAmountInUsd.toString()}
        remaining={leftToRepayFormatted}
        remainingUsd={apiLoan?.leftToRepayInUsd.toString()}
        repaid={repaidPrincipalFormatted}
        repaidUsd={(apiLoan?.repaidPrincipalInUsd ?? '0').toString()}
        status={status}
      />

      <ListAPRColumn symbol={market?.asset?.symbol ?? 'default'} value={loan.market?.apr ?? 0} />

      {status === LoanStatus.Active ? (
        <ListRepaidColumn
          original={totalAccruedInterestFormatted}
          originalUsd={apiLoan?.totalAccruedInterestInUsd.toString()}
          remaining={interestToPayFormatted}
          remainingUsd={apiLoan?.interestToPayInUsd.toString()}
          repaid={interestPaidFormatted}
          repaidUsd={apiLoan?.interestPaidInUsd.toString()}
          status={status}
        />
      ) : (
        <ListColumn>0</ListColumn>
      )}

      <ListColumn>
        <StatusChip status={status} />
      </ListColumn>

      <ListColumn>
        {status === LoanStatus.Active
          ? loan?.apiLoan?.data && (
              <Button
                endIcon={
                  <SvgIcon sx={{ width: 14, height: 14 }}>
                    <ExternalLinkIcon />
                  </SvgIcon>
                }
                component={Link}
                href={`https://ipfs.io/ipfs/${loan.apiLoan.data}`}
                variant="outlined"
                size="small"
              >
                <Typography variant="buttonS">open agreement</Typography>
              </Button>
            )
          : ''}
      </ListColumn>

      <ListButtonsColumn>
        {!admin && (
          <Button
            variant="contained"
            onClick={() => openRepayLoan(loan)}
            disabled={
              status !== LoanStatus.Active ||
              Number(leftToRepayFormatted) + Number(interestToPayFormatted) === 0
            }
          >
            Repay
          </Button>
        )}
        {status === LoanStatus.Requested && admin && (
          <Button variant="contained" onClick={() => openApproveLoan(loan)}>
            Approve
          </Button>
        )}
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
