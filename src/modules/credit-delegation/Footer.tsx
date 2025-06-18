import { Box, Typography, useTheme } from '@mui/material';
import { Link } from 'src/components/primitives/Link';

export const Footer = () => {
  const theme = useTheme();
  const logo = theme.palette.mode === 'light' ? '/atomicaLightLogo.png' : '/atomicaDarkLogo.svg';
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'end',
        mt: 5,
        mb: 3,
        color: 'text.secondary',
        flexGrow: 1,
      }}
    >
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '20px',
          mr: 2,
        }}
      >
        Developed by
      </Typography>

      <Link
        href="https://atomica.org/"
        aria-label="Go to homepage"
        sx={{
          lineHeight: 0,
          mr: 3,
          transition: '0.3s ease all',
          '&:hover': { opacity: 0.7 },
        }}
      >
        <img src={logo} alt="An SVG of an eye" height={20} />
      </Link>
    </Box>
  );
};
