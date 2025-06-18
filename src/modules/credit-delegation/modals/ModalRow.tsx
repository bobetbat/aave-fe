import { Box, SxProps } from '@mui/material';
import { FC } from 'react';

interface ModalRowProps {
  children: React.ReactNode;
  sx?: SxProps;
}

export const ModalRow: FC<ModalRowProps> = ({ children, sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'stretch',
        alignItems: { xs: 'stretch', sm: 'center' },
        width: '100%',
        gap: 3,
        mb: 3,
        '& > *': {
          flex: 1,
          maxWidth: '100%',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
