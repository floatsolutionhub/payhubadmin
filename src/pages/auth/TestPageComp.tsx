import { Box, CircularProgress, Typography } from '@mui/material';

export default function TestPageComp() {

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Completing Microsoft sign-in...</Typography>
    </Box>
  );
}