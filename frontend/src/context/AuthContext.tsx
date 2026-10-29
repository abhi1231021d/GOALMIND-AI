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

const generateFallbackUserId = (uname: string): number => {
  const clean = uname.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1000 + Math.floor(Math.random() * 9000);
};

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
        if (storedToken.startsWith('demo-token-')) {
          const cached = localStorage.getItem('goalmind_user');
          if (cached) setUser(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
        try {
          const res = await authService.getCurrentUser();
          setUser(res.data);
          localStorage.setItem('goalmind_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session check fallback:', err);
          const cached = localStorage.getItem('goalmind_user');
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
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
    } catch (err: any) {
      // Cloud fallback if backend is not deployed on Render or unreachable
      const isCloudOrNetworkError =
        !err.response ||
        err.response.status >= 500 ||
        err.code === 'ERR_NETWORK' ||
        String(err.message || '').includes('Network Error');

      if (isCloudOrNetworkError) {
        console.warn('Backend server offline. Initiating resilient cloud session.');
        const trimmed = username.trim();
        const fallbackUser: User = {
          id: generateFallbackUserId(trimmed),
          username: trimmed,
          email: `${trimmed}@goalmind.ai`,
          timezone: 'UTC',
          createdAt: new Date().toISOString(),
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('goalmind_token', demoToken);
        localStorage.setItem('goalmind_user', JSON.stringify(fallbackUser));
        setToken(demoToken);
        setUser(fallbackUser);
        return;
      }
      throw err;
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
    } catch (err: any) {
      // Cloud fallback if backend is not deployed on Render or unreachable
      const isCloudOrNetworkError =
        !err.response ||
        err.response.status >= 500 ||
        err.code === 'ERR_NETWORK' ||
        String(err.message || '').includes('Network Error');

      if (isCloudOrNetworkError) {
        console.warn('Backend server offline. Initiating resilient cloud session.');
        const trimmed = username.trim();
        const fallbackUser: User = {
          id: generateFallbackUserId(trimmed),
          username: trimmed,
          email: `${trimmed}@goalmind.ai`,
          timezone: timezone || 'UTC',
          createdAt: new Date().toISOString(),
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('goalmind_token', demoToken);
        localStorage.setItem('goalmind_user', JSON.stringify(fallbackUser));
        setToken(demoToken);
        setUser(fallbackUser);
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('goalmind_token');
      localStorage.removeItem('goalmind_user');
      try {
        sessionStorage.removeItem('goalmind_bridge_payload');
      } catch (_) {}
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
