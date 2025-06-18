import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';

import { AtomicaLoan, LoanStatus } from '../../types';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileAssetRow } from '../MobileAssetRow';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';
import { StatusChip } from './StatusChip';

interface LoanListItemProps extends AtomicaLoan {
  admin?: boolean;
}

export const LoanListItemMobile = ({ admin, ...loan }: LoanListItemProps) => {
  const { openRepayLoan, openApproveLoan } = useModalContext();
  const {
    policyId,
    id,
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

  const symbol = market?.asset?.symbol ?? 'Unknown';
  const name = market?.asset?.name ?? 'Unknown';
  const apr = market?.apr ?? 0;

  // US Dollar amounts (as strings) from apiLoan
  const borrowedUsd = apiLoan?.borrowedAmountInUsd?.toString();
  const leftToRepayUsd = apiLoan?.leftToRepayInUsd?.toString();
  const repaidUsd = apiLoan?.repaidPrincipalInUsd?.toString() ?? '0';
  const totalInterestUsd = apiLoan?.totalAccruedInterestInUsd?.toString();
  const interestToPayUsd = apiLoan?.interestToPayInUsd?.toString();
  const interestPaidUsd = apiLoan?.interestPaidInUsd?.toString();
  const ipfsHash = apiLoan?.data;

  return (
    <ListMobileItemWrapper>
      <MobileAssetRow
        symbol={symbol}
        name={name}
        right={
          <MobileDataCell
            caption=""
            hintId="APR"
            value={apr}
            valueProps={{ percent: true }}
            right
          />
        }
      />
      <MobileRow
        left={
          <Typography fontWeight={500}>
            {policyId}/{id.split('-')[1] ?? 'N'}
          </Typography>
        }
        right={<StatusChip status={status} />}
      />
      <MobileFullRow>
        {market?.product.title}: {market?.title}
      </MobileFullRow>
      <MobileRow
        left={
          <MobileDataCell
            caption="Principal"
            hintId="Principal"
            value={borrowedAmountFormatted}
            subValue={borrowedUsd}
            left
          />
        }
        right={
          <MobileDataCell
            caption="Repaid"
            hintId="Repaid"
            value={repaidPrincipalFormatted}
            subValue={repaidUsd}
            right
          />
        }
      />

      <MobileRow
        left={<></>}
        right={
          <MobileDataCell
            caption="Remaining"
            hintId="Remaining"
            value={leftToRepayFormatted}
            subValue={leftToRepayUsd}
            right
          />
        }
      />

      {status === LoanStatus.Active ? (
        <>
          {/* Total Interest */}
          <MobileRow
            left={
              <MobileDataCell
                caption="Total Interest"
                hintId="totalInterest"
                value={totalAccruedInterestFormatted}
                subValue={totalInterestUsd}
                left
              />
            }
            right={
              <MobileDataCell
                caption="Interest Repaid"
                hintId="interestRepaid"
                value={interestPaidFormatted}
                subValue={interestPaidUsd}
                right
              />
            }
          />

          {/* Interest repaid vs. remaining */}
          <MobileRow
            left={<></>}
            right={
              <MobileDataCell
                caption="Interest Remaining"
                hintId="interestRemaining"
                value={interestToPayFormatted}
                subValue={interestToPayUsd}
                right
              />
            }
          />
        </>
      ) : (
        // If not Active, show '0' for interest
        <MobileFullRow sx={{ fontWeight: 500 }}>
          <MobileDataCell caption="Total Interest" hintId="totalInterest" value="0" left />
        </MobileFullRow>
      )}

      {status === LoanStatus.Active && ipfsHash && (
        <MobileFullRow>
          <MobileDataCell caption="Agreement" left>
            <Button
              endIcon={
                <SvgIcon sx={{ width: 14, height: 14 }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              }
              component={Link}
              href={`https://ipfs.io/ipfs/${ipfsHash}`}
              variant="outlined"
              size="small"
            >
              <Typography variant="buttonS">open agreement</Typography>
            </Button>
          </MobileDataCell>
        </MobileFullRow>
      )}

      <MobileFullRow>
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
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
