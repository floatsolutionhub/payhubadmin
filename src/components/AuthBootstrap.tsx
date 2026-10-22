import { useEffect } from 'react';
import { clearApiAccessToken, setApiAccessToken } from '../services/api';
import { oidcAuthService } from '../services/auth/oidcAuthService';
import { useAppDispatch } from '../store';
import { logout, setAuthInitializing, setIdpAuthSession } from '../store/authSlice';

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname === '/callback' || pathname === '/logout' || pathname === '/silent-renew') {
      dispatch(setAuthInitializing(false));
      return;
    }

    let mounted = true;

    const initialize = async () => {
      dispatch(setAuthInitializing(true));

      try {
        const idpPayload = await oidcAuthService.restoreSession();

        if (!mounted) {
          return;
        }

        if (!idpPayload || !idpPayload.access_token) {
          clearApiAccessToken();
          dispatch(logout());
          return;
        }

        const profile = (idpPayload.profile ?? {}) as Record<string, unknown>;
        const roleClaim = profile.role;
        const roles = Array.isArray(roleClaim)
          ? roleClaim.map((entry) => String(entry))
          : typeof roleClaim === 'string'
            ? [roleClaim]
            : [];
        const expiresInValue = typeof idpPayload.expires_in === 'number' ? idpPayload.expires_in : 0;

        setApiAccessToken(idpPayload.access_token);
        dispatch(
          setIdpAuthSession({
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
              accessToken: idpPayload.access_token,
              idToken: idpPayload.id_token || '',
              tokenType: 'Bearer',
              scope: idpPayload.scope || '',
              expiresIn: expiresInValue
            }
          })
        );
      } catch {
        if (mounted) {
          clearApiAccessToken();
          dispatch(logout());
        }
      } finally {
        if (mounted) {
          dispatch(setAuthInitializing(false));
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return null;
}
