import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(160deg, #f5f8ff 0%, #eef4ff 45%, #ffffff 100%)',
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            backgroundColor: '#ffffff',
            boxShadow: '0 14px 40px rgba(0, 73, 135, 0.14)',
            border: '1px solid rgba(0, 73, 135, 0.12)'
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', sm: '5.5rem' },
              lineHeight: 1,
              color: '#004987',
              mb: 1,
              letterSpacing: '-0.03em'
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: '#0f172a',
              mb: 1,
              fontWeight: 700
            }}
          >
            Page not found
          </Typography>

          <Typography
            sx={{
              color: '#475569',
              mb: 3,
              maxWidth: 420,
              mx: 'auto'
            }}
          >
            The page you are trying to reach does not exist or may have been moved.
          </Typography>

          <Button
            variant="contained"
            onClick={handleGoBack}
            sx={{
              px: 3.5,
              py: 1.1,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              backgroundColor: '#004987',
              '&:hover': {
                backgroundColor: '#003a6d'
              }
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
