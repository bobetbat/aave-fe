import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Button, Link, ListItem, SvgIcon, Typography } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { getHardcodedAgreementUrl } from 'src/helpers/getHardcodedAgreementUrl';

import { ListButtonsColumn } from '../ListButtonsColumn';

export const BorrowerListItem = ({
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
    <ListItem>
      <ListColumn align="center">{title}</ListColumn>
      <ListColumn align="center">{borrowerName}</ListColumn>
      {/* <ListColumn align="center">{details ?? '--'}</ListColumn> */}
      <ListColumn align="center">{creditLine ?? '--'}</ListColumn>
      <ListButtonsColumn>
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
      </ListButtonsColumn>
    </ListItem>
  );
};
