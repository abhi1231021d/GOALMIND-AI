import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, timezone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('goalmind_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('goalmind_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('goalmind_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          setUser(res.data);
          localStorage.setItem('goalmind_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('goalmind_token');
          localStorage.removeItem('goalmind_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ username: username.trim(), password });
      const authData: AuthResponse = res.data;
      localStorage.setItem('goalmind_token', authData.token);
      localStorage.setItem('goalmind_user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, timezone?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.register({
        username: username.trim(),
        password,
        timezone: timezone || 'UTC',
      });
      const authData: AuthResponse = res.data;
      localStorage.setItem('goalmind_token', authData.token);
      localStorage.setItem('goalmind_user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('goalmind_token');
      localStorage.removeItem('goalmind_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('goalmind_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
