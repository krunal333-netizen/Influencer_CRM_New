import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { SafeUser } from '../types/auth';
import { logoutRequest, meRequest } from '../api/client';

export interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  setUser: (user: SafeUser | null) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await meRequest();
      setUser(profile);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateUser = useCallback((nextUser: SafeUser | null) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      setUser: updateUser,
      refreshProfile,
      logout,
    }),
    [user, isLoading, updateUser, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
