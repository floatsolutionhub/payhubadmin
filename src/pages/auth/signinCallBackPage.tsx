import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearApiAccessToken, setApiAccessToken } from '../../services/api';
import { oidcAuthService } from '../../services/auth/oidcAuthService';
import { useAppDispatch } from '../../store';
import { logout, setIdpAuthSession } from '../../store/authSlice';
import { toast } from 'react-toastify';

export default function SigninCallBackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasHandledCallback = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  const useMockAuth = String(import.meta.env.VITE_USE_MOCK_AUTH || 'false').toLowerCase() === 'true';

  const handleLogout = async () => {
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
        navigate('/');
      }
    };

// const REQUIRED_ROLE = "DOMAIN1\\CUSTOMER_RISK_INIT_TEST";

const REQUIRED_ROLE = "DOMAIN1\\HR_Onboard";

useEffect(() => {
  if (hasHandledCallback.current) {
    return;
  }

  hasHandledCallback.current = true;

  const complete = async () => {
    try {
      const idpPayload = await oidcAuthService.completeLogin();
      console.log("IDP callback payload:", idpPayload);

      const profile = (idpPayload.profile ?? {}) as Record<string, unknown>;

      const roleClaim = profile.role;
      const roles = Array.isArray(roleClaim)
        ? roleClaim.map(String)
        : typeof roleClaim === "string"
        ? [roleClaim]
        : [];

      console.log("Roles:", roles);

      // if (!roles.includes(REQUIRED_ROLE)) {
      //   toast.error("Unauthorized user.");
      //   await oidcAuthService.startLogout();

      //   // Clear any stored tokens
      //   handleLogout(); // or whatever your logout action is

      //   // Logout from the Identity Provider
        

      //   return;
      // }

      if (idpPayload.access_token) {
        setApiAccessToken(idpPayload.access_token);
      }

      dispatch(
        setIdpAuthSession({
          userBiodata: {
            given_name:
              typeof profile.given_name === "string"
                ? profile.given_name
                : "",
            family_name:
              typeof profile.family_name === "string"
                ? profile.family_name
                : "",
            middle_name:
              typeof profile.middle_name === "string"
                ? profile.middle_name
                : "",
            department:
              typeof profile.department === "string"
                ? profile.department
                : "",
            subsidiary:
              typeof profile.subsidiary === "string"
                ? profile.subsidiary
                : "",
            role: roles,
            sub: typeof profile.sub === "string" ? profile.sub : "",
            ...profile,
          },
          tokenData: {
            accessToken: idpPayload.access_token || "",
            idToken: idpPayload.id_token || "",
            tokenType: "Bearer",
            scope: idpPayload.scope || "",
            expiresIn:
              typeof idpPayload.expires_in === "number"
                ? idpPayload.expires_in
                : 0,
          },
        })
      );

      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Callback processing failed. Check console for payload details."
      );
    }
  };

  void complete();
}, [dispatch, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Completing sign-in...</Typography>
      {errorMessage ? <Typography color="error">{errorMessage}</Typography> : null}
    </Box>
  );
}