import { Box, SxProps, Theme } from '@mui/material';
import { FC } from 'react';

interface MobileFullRowProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const MobileFullRow: FC<MobileFullRowProps> = ({ children, sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'stretch',
        width: '100%',
        flexWrap: 'nowrap',
        '& > *': {
          flex: 1,
        },

        '&:not(:last-child)': {
          mb: 4,
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
