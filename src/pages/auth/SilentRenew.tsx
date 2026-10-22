import { useEffect } from 'react';
import { oidcAuthService } from '../../services/auth/oidcAuthService';

export default function SilentRenew() {
  useEffect(() => {
    const complete = async () => {
      try {
        await oidcAuthService.completeSilentRenew();
      } catch {
        // Silent renew failures are handled by the OIDC client/session checks.
      }
    };

    void complete();
  }, []);

  return null;
}
