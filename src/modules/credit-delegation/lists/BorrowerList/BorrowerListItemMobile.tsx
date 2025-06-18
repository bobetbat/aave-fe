import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Button, Link, SvgIcon, Typography } from '@mui/material';
import { getHardcodedAgreementUrl } from 'src/helpers/getHardcodedAgreementUrl';

import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { MobileDataCell } from '../MobileDataCell';
import { MobileRow } from '../MobileRow';

export const BorrowerListItemMobile = ({
  title,
  // product,
  wording,
  creditLine,
}: {
  id: string;
  title: string;
  product: {
    id: string;
    title: string;
  };
  wording: string;
  details: string;
  creditLine?: number;
}) => {
  const marketEntities = title.split('+');

  const borrowerName = marketEntities[marketEntities.length - 1] ?? '--';

  /* @HARDCODED */
  const hardcodedAgreementUrl = getHardcodedAgreementUrl(marketEntities);

  return (
    <ListMobileItemWrapper>
      <MobileRow
        left={
          <MobileDataCell caption="Product" left>
            {title}
          </MobileDataCell>
        }
        right={
          <MobileDataCell caption="Borrower" right>
            {borrowerName}
          </MobileDataCell>
        }
      />

      <MobileRow
        left={
          <MobileDataCell caption="Credit line size" left>
            {creditLine ? creditLine.toFixed(2) : '--'}
          </MobileDataCell>
        }
        right={
          <Button
            endIcon={
              <SvgIcon sx={{ width: 14, height: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            }
            component={Link}
            // href={wording}
            href={hardcodedAgreementUrl}
            variant="outlined"
            size="small"
            disabled={!wording}
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="buttonS">Loan Agreement</Typography>
          </Button>
        }
      />
    </ListMobileItemWrapper>
  );
};
