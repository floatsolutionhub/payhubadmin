import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearApiAccessToken, setApiAccessToken } from '../services/api';
import { oidcAuthService } from '../services/auth/oidcAuthService';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, setIdpAuthSession } from '../store/authSlice';

const useMockAuth = String(import.meta.env.VITE_USE_MOCK_AUTH || 'false').toLowerCase() === 'true';
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const WARNING_COUNTDOWN_SECONDS = 60;
const WARNING_TIMEOUT_MS = WARNING_COUNTDOWN_SECONDS * 1000;
const SHOW_WARNING_AFTER_MS = INACTIVITY_TIMEOUT_MS - WARNING_TIMEOUT_MS;
const RENEW_CHECK_INTERVAL_MS = 60 * 1000;
const RENEW_WHEN_SECONDS_LEFT = 120;

function buildIdpAuthSessionPayload(idpPayload: {
  access_token?: string;
  id_token?: string;
  scope?: string;
  expires_in?: number;
  profile?: Record<string, unknown>;
}) {
  const profile = (idpPayload.profile ?? {}) as Record<string, unknown>;
  const roleClaim = profile.role;
  const roles = Array.isArray(roleClaim)
    ? roleClaim.map((entry) => String(entry))
    : typeof roleClaim === 'string'
      ? [roleClaim]
      : [];

  return {
    userBiodata: {
      given_name: typeof profile.given_name === 'string' ? profile.given_name : '',
      family_name: typeof profile.family_name === 'string' ? profile.family_name : '',
      middle_name: typeof profile.middle_name === 'string' ? profile.middle_name : '',
      department: typeof profile.department === 'string' ? profile.department : '',
      subsidiary: typeof profile.subsidiary === 'string' ? profile.subsidiary : '',
      role: roles,
      sub: typeof profile.sub === 'string' ? profile.sub : '',
      ...profile
    },
    tokenData: {
      accessToken: idpPayload.access_token || '',
      idToken: idpPayload.id_token || '',
      tokenType: 'Bearer',
      scope: idpPayload.scope || '',
      expiresIn: typeof idpPayload.expires_in === 'number' ? idpPayload.expires_in : 0
    }
  };
}

export default function SessionSecurityManager() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasAccessToken = useAppSelector((state) => Boolean(state.auth.tokenData?.accessToken));

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(WARNING_COUNTDOWN_SECONDS);

  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const renewIntervalRef = useRef<number | null>(null);
  const renewInFlightRef = useRef(false);
  const isLoggingOutRef = useRef(false);

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const clearInactivityTimers = useCallback(() => {
    if (warningTimerRef.current !== null) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    clearCountdownInterval();
  }, [clearCountdownInterval]);

  const performLogout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;
    clearInactivityTimers();

    if (useMockAuth) {
      window.sessionStorage.removeItem('auth:mockUser');
      clearApiAccessToken();
      dispatch(logout());
      navigate('/auth/admin', { replace: true });
      return;
    }

    try {
      await oidcAuthService.startLogout();
    } catch {
      clearApiAccessToken();
      dispatch(logout());
      navigate('/auth/admin', { replace: true });
    }
  }, [clearInactivityTimers, dispatch, navigate]);

  const openWarning = useCallback(() => {
    setIsWarningOpen(true);
    setCountdownSeconds(WARNING_COUNTDOWN_SECONDS);

    clearCountdownInterval();
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdownSeconds((previousValue) => {
        if (previousValue <= 1) {
          window.clearInterval(countdownIntervalRef.current ?? undefined);
          countdownIntervalRef.current = null;
          return 0;
        }

        return previousValue - 1;
      });
    }, 1000);
  }, [clearCountdownInterval]);

  const scheduleInactivityTimers = useCallback(() => {
    clearInactivityTimers();

    warningTimerRef.current = window.setTimeout(() => {
      openWarning();
    }, SHOW_WARNING_AFTER_MS);

    logoutTimerRef.current = window.setTimeout(() => {
      void performLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimers, openWarning, performLogout]);

  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated || !hasAccessToken || isLoggingOutRef.current) {
      return;
    }

    if (isWarningOpen) {
      setIsWarningOpen(false);
      setCountdownSeconds(WARNING_COUNTDOWN_SECONDS);
      clearCountdownInterval();
    }

    scheduleInactivityTimers();
  }, [clearCountdownInterval, hasAccessToken, isAuthenticated, isWarningOpen, scheduleInactivityTimers]);

  const keepSessionAlive = useCallback(async () => {
    if (!isAuthenticated || !hasAccessToken || renewInFlightRef.current || isLoggingOutRef.current) {
      return;
    }

    try {
      renewInFlightRef.current = true;
      const currentSession = await oidcAuthService.restoreSession();

      if (!currentSession?.access_token) {
        return;
      }

      const shouldRenew = typeof currentSession.expires_in !== 'number' || currentSession.expires_in <= RENEW_WHEN_SECONDS_LEFT;

      if (!shouldRenew) {
        return;
      }

      const renewedSession = await oidcAuthService.renewSession();

      if (!renewedSession.access_token) {
        return;
      }

      setApiAccessToken(renewedSession.access_token);
      dispatch(setIdpAuthSession(buildIdpAuthSessionPayload(renewedSession)));
    } catch {
      // Keep existing session state when silent renew fails; inactivity flow handles final logout.
    } finally {
      renewInFlightRef.current = false;
    }
  }, [dispatch, hasAccessToken, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !hasAccessToken) {
      setIsWarningOpen(false);
      setCountdownSeconds(WARNING_COUNTDOWN_SECONDS);
      isLoggingOutRef.current = false;
      clearInactivityTimers();

      if (renewIntervalRef.current !== null) {
        window.clearInterval(renewIntervalRef.current);
        renewIntervalRef.current = null;
      }

      return;
    }

    scheduleInactivityTimers();
    void keepSessionAlive();

    renewIntervalRef.current = window.setInterval(() => {
      void keepSessionAlive();
    }, RENEW_CHECK_INTERVAL_MS);

    const activityEvents: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });

      if (renewIntervalRef.current !== null) {
        window.clearInterval(renewIntervalRef.current);
        renewIntervalRef.current = null;
      }

      clearInactivityTimers();
    };
  }, [clearInactivityTimers, handleUserActivity, hasAccessToken, isAuthenticated, keepSessionAlive, scheduleInactivityTimers]);

  return (
    <Dialog
      open={isWarningOpen}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }

        handleUserActivity();
      }}
      maxWidth="xs"
      fullWidth>
      <DialogTitle>Session Timeout Warning</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          You have been inactive for a while. For security, you will be logged out in 60 seconds.
        </Typography>
        <Box
          sx={{
            mt: 2,
            py: 1.5,
            px: 2,
            borderRadius: 1,
            bgcolor: '#F5F7FA',
            border: '1px solid #E4E7EC'
          }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {countdownSeconds}s
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => void performLogout()}>
          Logout Now
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleUserActivity();
          }}>
          Stay Signed In
        </Button>
      </DialogActions>
    </Dialog>
  );
}