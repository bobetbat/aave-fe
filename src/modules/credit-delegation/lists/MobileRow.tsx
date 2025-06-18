import { Box } from '@mui/material';
import { FC } from 'react';

interface MobileRowProps {
  left: React.ReactNode;
  right?: React.ReactNode;
}

export const MobileRow: FC<MobileRowProps> = ({ left, right }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: right === undefined ? 'flex-start' : 'space-between',
        width: '100%',
        flexWrap: 'nowrap',

        '&:not(:last-child)': {
          mb: 4,
        },

        '& > div': {
          maxWidth: '50%',
        },
      }}
    >
      <Box>{left}</Box>

      <Box>{right}</Box>
    </Box>
  );
};
