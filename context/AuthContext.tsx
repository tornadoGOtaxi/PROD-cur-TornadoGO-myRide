import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_hash: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIX: Made children prop optional to resolve TypeScript error in index.tsx.
export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { users } = useData();

  const login = (email: string, password_hash: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password_hash === password_hash && u.active);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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