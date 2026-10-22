import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { oidcAuthService } from '../../services/auth/oidcAuthService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const complete = async () => {
      try {
        const idpPayload = await oidcAuthService.completeLogin();
        console.log('IDP callback payload:', idpPayload);
        navigate('/admin/dashboard', { replace: true });
      } catch (error) {
        console.log('IDP callback error:', error);
        navigate('/auth/admin', { replace: true });
      }
    };

    void complete();

    return undefined;
  }, [navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Completing Microsoft sign-in...</Typography>
    </Box>
  );
}
