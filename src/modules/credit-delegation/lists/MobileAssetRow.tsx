import { Box, Tooltip, Typography } from '@mui/material';
import { FC } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

interface MobileAssetRowProps {
  symbol: string;
  name: string;
  right?: React.ReactNode;
}

export const MobileAssetRow: FC<MobileAssetRowProps> = ({ symbol, name, right }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: right === undefined ? 'flex-start' : 'space-between',
        width: '100%',
        flexWrap: 'nowrap',

        '&:not(:last-child)': {
          mb: 4,
        },
      }}
    >
      <Box>
        {' '}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={symbol} fontSize="large" />
          <Tooltip title={`${name} (${symbol})`} arrow placement="top">
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {symbol}
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      <Box>{right}</Box>
    </Box>
  );
};
