import { ExternalLinkIcon } from '@heroicons/react/outline'; // or solid—adjust as needed
import { Button, ListItem, SvgIcon, Typography } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { getHardcodedAgreementUrl } from 'src/helpers/getHardcodedAgreementUrl';

import { AtomicaLoan, LoanStatus } from '../../types';
import { convertTimestampToDate } from '../../utils';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListRepaidColumn } from '../LoansList/ListRepaidColumn';

interface DetailsLoanPositionsProps extends AtomicaLoan {}

export const DetailsLoanPositionsListItem = ({ ...loan }: DetailsLoanPositionsProps) => {
  const {
    policyId,
    id,
    market,
    status = LoanStatus.Active, // default Active to match old usage
    apiLoan,
    borrowedAmountFormatted,
    leftToRepayFormatted,
    repaidPrincipalFormatted,
    totalAccruedInterestFormatted,
    interestToPayFormatted,
    interestPaidFormatted,
  } = loan;

  const createdAt = apiLoan?.createdAt || 0;
  const marketEntities = market?.title?.split(' - ') || [];
  const borrowerName = marketEntities[marketEntities.length - 1] || '--';

  /* @HARDCODED */
  const hardcodedAgreementUrl = getHardcodedAgreementUrl(marketEntities);

  return (
    <ListItem>
      <ListColumn>
        {policyId}/{id.split('-')[1] ?? 'N'}
      </ListColumn>

      <ListColumn>{convertTimestampToDate(createdAt.toString())}</ListColumn>

      <ListAPRColumn symbol={market?.asset?.symbol ?? 'default'} value={market?.apr ?? 0} />

      <ListColumn sx={{ fontSize: 10 }}>
        <Row key={market?.id}>{borrowerName}</Row>
      </ListColumn>

      <ListRepaidColumn
        original={borrowedAmountFormatted}
        originalUsd={apiLoan?.borrowedAmountInUsd?.toString()}
        repaid={repaidPrincipalFormatted}
        repaidUsd={apiLoan?.repaidPrincipalInUsd?.toString()}
        remaining={leftToRepayFormatted}
        remainingUsd={apiLoan?.leftToRepayInUsd?.toString()}
        status={status}
      />

      <ListRepaidColumn
        original={totalAccruedInterestFormatted}
        originalUsd={apiLoan?.totalAccruedInterestInUsd?.toString()}
        repaid={interestPaidFormatted}
        repaidUsd={apiLoan?.interestPaidInUsd?.toString()}
        remaining={interestToPayFormatted}
        remainingUsd={apiLoan?.interestToPayInUsd?.toString()}
        status={status}
        decimals={4}
      />

      <ListButtonsColumn>
        {apiLoan?.data && (
          <Button
            endIcon={
              <SvgIcon sx={{ width: 14, height: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            }
            component={Link}
            href={hardcodedAgreementUrl}
            variant="outlined"
            size="small"
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="buttonS">open agreement</Typography>
          </Button>
        )}
      </ListButtonsColumn>
    </ListItem>
  );
};
