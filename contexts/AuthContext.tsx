// /contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'dealer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  buyerLogin: (email: string, password: string) => Promise<void>;
  dealerLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerBuyer: (buyerData: any) => Promise<void>;
  registerDealer: (dealerData: any) => Promise<void>;
  updateUserInfo: (updatedUser: User) => void; // New function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get current user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const buyerLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.buyerLogin(email, password);
      authService.setAuthData(data.accessToken, data.user);
      setUser(data.user);
      router.push('/dashboard'); // Ensure this is executed
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const dealerLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.dealerLogin(email, password);
      authService.setAuthData(data.accessToken, data.user);
      setUser(data.user);
      router.push('/dashboard'); // Ensure this is executed
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
  };

  const registerBuyer = async (buyerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.registerBuyer(buyerData);
      authService.setAuthData(data.accessToken, data.user); // Save token and user data
      setUser(data.user);
      router.push('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerDealer = async (dealerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.registerDealer(dealerData);
      authService.setAuthData(data.accessToken, data.user); // Save token and user data
      setUser(data.user);
      router.push('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // New function to update user information
  const updateUserInfo = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Also update in localStorage to persist changes
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken) {
      authService.setAuthData(currentToken, updatedUser);
    }
  };

  const value = {
    user,
    loading,
    error,
    buyerLogin,
    dealerLogin,
    logout,
    registerBuyer,
    registerDealer,
    updateUserInfo // Added to context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};