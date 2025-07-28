'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('global-news-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('global-news-user');
    } finally {
      // Add a small delay to prevent flash of login screen on reload
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Mock login logic
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && pass) {
          const mockUser = { name: 'Demo User', email };
          localStorage.setItem('global-news-user', JSON.stringify(mockUser));
          setUser(mockUser);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
        setLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('global-news-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
