import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import { clearApiAccessToken } from '../../services/api';
import { oidcAuthService } from '../../services/auth/oidcAuthService';

export default function LogoutCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const complete = async () => {
      try {
        await oidcAuthService.completeLogout();
      } finally {
        clearApiAccessToken();
        dispatch(logout());

        if (mounted) {
          navigate('/auth/admin', { replace: true });
        }
      }
    };

    void complete();

    return () => {
      mounted = false;
    };
  }, [dispatch, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Signing you out...</Typography>
    </Box>
  );
}
