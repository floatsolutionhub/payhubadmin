import {
  UserManager,
  WebStorageStateStore,
  type User,
  type UserManagerSettings
} from 'oidc-client-ts';

const oidcSettings: UserManagerSettings = {
  authority: import.meta.env.VITE_AUTHORITY,
  client_id: import.meta.env.VITE_CLIENT,
  scope: import.meta.env.VITE_SCOPE,
  redirect_uri: import.meta.env.VITE_CALLBACK,
  silent_redirect_uri: (import.meta.env.VITE_SILENT_CALLBACK as string | undefined)?.trim() || `${window.location.origin}/silent-renew`,
  response_type: 'code',
  response_mode: 'query',
  post_logout_redirect_uri: import.meta.env.VITE_LOGOUT,
  automaticSilentRenew: true,
  loadUserInfo: true,
  monitorSession: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage })
};

const userManager = new UserManager(oidcSettings);

async function clearLocalOidcSession(): Promise<void> {
  try {
    await userManager.revokeTokens();
  } catch {
    // Some providers do not expose revocation endpoint.
  }

  await userManager.removeUser();
  await userManager.clearStaleState();
}
export const oidcAuthService = {
  async startLogin(): Promise<void> {
    await userManager.signinRedirect({
      prompt: 'login'
    });
  },

  async completeLogin(): Promise<User> {
    const idpResponse = await userManager.signinRedirectCallback();
    console.log('OIDC IdP response:', idpResponse);
    return idpResponse;
  },

  async restoreSession(): Promise<User | null> {
    const user = await userManager.getUser();
    console.log('OIDC restoreSession response:', user);
    return user;
  },

  async renewSession(): Promise<User> {
    const renewedUser = await userManager.signinSilent();
    return renewedUser;
  },

  async startLogout(): Promise<void> {
    const user = await userManager.getUser();
    await clearLocalOidcSession();

    await userManager.signoutRedirect({
      id_token_hint: user?.id_token
    });
  },

  async completeLogout(): Promise<void> {
    try {
      await userManager.signoutRedirectCallback();
    } finally {
      await clearLocalOidcSession();
    }
  },

  async completeSilentRenew(): Promise<void> {
    await userManager.signinSilentCallback();
  }

};
