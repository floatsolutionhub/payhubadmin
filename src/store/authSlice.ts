import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserType = 'admin' | 'employee' | 'intern';

export interface User {
  name: string;
  email: string;
  role: string;
  initials: string;
  userType: UserType;
}

export interface UserBiodata {
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  department?: string;
  subsidiary?: string;
  role?: string[];
  sub?: string;
  [key: string]: unknown;
}

export interface AuthTokenData {
  accessToken: string;
  idToken: string;
  tokenType: string;
  scope: string;
  expiresIn: number;
}

export interface IdpAuthSessionPayload {
  userBiodata: UserBiodata;
  tokenData: AuthTokenData;
}

interface AuthState {
  user: User | null;
  userBiodata: UserBiodata | null;
  tokenData: AuthTokenData | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const mockUsers: Record<UserType, User> = {
  admin: {
    name: 'Temitope Adewale',
    email: 'temitope.adewale@fsdh.com',
    role: 'HR Manager',
    initials: 'TA',
    userType: 'admin'
  },
  employee: {
    name: 'John Okafor',
    email: 'john.okafor@fsdh.com',
    role: 'New Employee',
    initials: 'JO',
    userType: 'employee'
  },
  intern: {
    name: 'Sarah Adeyemi',
    email: 'sarah.adeyemi@fsdh.com',
    role: 'Intern',
    initials: 'SA',
    userType: 'intern'
  }
};

const initialState: AuthState = {
  user: null,
  userBiodata: null,
  tokenData: null,
  isAuthenticated: false,
  isInitializing: true
};

function getInitials(name: string): string {
  const chunks = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (chunks.length === 0) {
    return 'US';
  }

  return chunks.map((part) => part.charAt(0).toUpperCase()).join('');
}

function deriveEmailFromSub(sub: unknown): string {
  if (typeof sub !== 'string') {
    return 'Email : N/A';
  }

  const trimmedSub = sub.trim();
  if (!trimmedSub) {
    return 'Email : N/A';
  }

  const usernameFromDomain = trimmedSub.split('\\').pop() || trimmedSub;
  const username = usernameFromDomain.split('@')[0]?.trim() || '';

  if (!username) {
    return 'Email : N/A';
  }

  return `${username.toLowerCase()}@fsdhgroup.com`;
}

function buildUserFromBiodata(biodata: UserBiodata): User {
  const givenName = typeof biodata.given_name === 'string' ? biodata.given_name : '';
  const middleName = typeof biodata.middle_name === 'string' ? biodata.middle_name : '';
  const familyName = typeof biodata.family_name === 'string' ? biodata.family_name : '';
  const fullName = `${givenName} ${middleName} ${familyName}`.replace(/\s+/g, ' ').trim() || 'Unknown User';
  const roleList = Array.isArray(biodata.role) ? biodata.role : [];

  return {
    name: fullName,
    email: deriveEmailFromSub(biodata.sub),
    role: roleList[0] || 'User',
    initials: getInitials(fullName),
    userType: 'admin'
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{userType: UserType;}>) {
      state.user = mockUsers[action.payload.userType];
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    setAuthenticatedUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.userBiodata = null;
      state.tokenData = null;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    setIdpAuthSession(state, action: PayloadAction<IdpAuthSessionPayload>) {
      state.userBiodata = action.payload.userBiodata;
      state.tokenData = action.payload.tokenData;
      state.user = buildUserFromBiodata(action.payload.userBiodata);
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    logout(state) {
      state.user = null;
      state.userBiodata = null;
      state.tokenData = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    setAuthInitializing(state, action: PayloadAction<boolean>) {
      state.isInitializing = action.payload;
    }
  }
});

export const { login, setAuthenticatedUser, setIdpAuthSession, logout, setAuthInitializing } = authSlice.actions;
export default authSlice.reducer;