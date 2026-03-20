"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface User {
  sub: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ useCallback prevents function from recreating every render
  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed', error);
  } finally {
    setUser(null);
    router.replace('/login');
  }
};
  // ✅ useMemo prevents infinite re-renders
  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      fetchUser,
    }),
    [user, loading, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}