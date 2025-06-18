// import { ExternalLinkIcon } from '@heroicons/react/solid';
// import { Button, SvgIcon, Typography } from '@mui/material';
// import { getHardcodedAgreementUrl } from 'src/helpers/getHardcodedAgreementUrl';
// import { Link } from 'src/components/primitives/Link';

import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, SvgIcon, Typography } from '@mui/material';
import Link from 'next/link';

import { AtomicaLoan } from '../../types';
import { convertTimestampToDate } from '../../utils';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileDataCell } from '../MobileDataCell';
import { MobileFullRow } from '../MobileFullRow';
import { MobileRow } from '../MobileRow';

interface DetailsLoanPositionsListItemMobileProps extends AtomicaLoan {}

export const DetailsLoanPositionsListItemMobile = ({
  ...loan
}: DetailsLoanPositionsListItemMobileProps) => {
  const { policyId, id, market, apiLoan, leftToRepayFormatted, interestToPayFormatted } = loan;

  const createdAt = apiLoan?.createdAt || 0;

  const marketEntities = market?.title.split('+') ?? [];
  const borrowerName = marketEntities[marketEntities.length - 1] ?? '--';
  const leftToRepayUsd = apiLoan?.leftToRepayInUsd?.toString() || '0';
  const interestToPayUsd = apiLoan?.interestToPayInUsd?.toString() || '0';

  return (
    <ListMobileItemWrapper>
      <MobileRow
        left={
          <MobileDataCell caption="Loan ID" left>
            {policyId}/{id.split('-')[1] ?? 'N'}
          </MobileDataCell>
        }
        right={
          <MobileDataCell caption="Date" right>
            {convertTimestampToDate(createdAt.toString())}
          </MobileDataCell>
        }
      />

      <MobileRow
        left={
          <MobileDataCell
            caption="APR"
            value={market?.apr ?? 0}
            valueProps={{ percent: true }}
            left
          />
        }
        right={
          <MobileDataCell caption="Borrower" right>
            {borrowerName}
          </MobileDataCell>
        }
      />

      <MobileRow
        left={
          <MobileDataCell
            caption="Remaining Principal"
            hintId="Remaining Principal"
            value={leftToRepayFormatted}
            subValue={leftToRepayUsd}
            left
          />
        }
        right={
          <MobileDataCell
            caption="Remaining Interest"
            hintId="Remaining Interest"
            value={interestToPayFormatted}
            subValue={interestToPayUsd}
            right
          />
        }
      />

      <MobileFullRow>
        {apiLoan?.data && (
          <Button
            endIcon={
              <SvgIcon sx={{ width: 14, height: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            }
            component={Link}
            href={`https://ipfs.io/ipfs/${apiLoan.data}`}
            variant="outlined"
            size="small"
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="buttonS">open agreement</Typography>
          </Button>
        )}
      </MobileFullRow>
    </ListMobileItemWrapper>
  );
};
