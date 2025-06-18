import { Box, Skeleton } from '@mui/material';
import { ReactNode } from 'react';

// These are all optional due to MobileListItemLoader
interface ListMobileItemWrapperProps {
  loading?: boolean;
  children: ReactNode;
}

export const ListMobileItemWrapper = ({ loading, children }: ListMobileItemWrapperProps) => {
  return (
    <Box
      sx={{
        p: 4,
        '&:not(:last-child)': {
          borderBottom: (theme) => `1px solid ${theme.palette.border.header}`,
        },

        '&:nth-child(even)': {
          backgroundColor: (theme) => theme.palette.background.paper,
        },
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'stretch',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton width="100%" height={24} sx={{}} />
          </Box>
        </Box>
      ) : (
        children
      )}
    </Box>
  );
};
