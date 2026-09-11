// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchToGuest: () => void;
  showGuestAuthModal: boolean;
  setShowGuestAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGuestAuthModal, setShowGuestAuthModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const backendUser = await authApi.getCurrentUser();
        setCurrentUser(backendUser);
      } catch (err) {
        // Not authenticated
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isAuthenticated = !!currentUser && !currentUser.isGuest;
  const isGuest = !!currentUser?.isGuest;

  const login = async (email?: string, password?: string) => {
    const backendUser = await authApi.login(email, password);
    setCurrentUser(backendUser);
    setShowGuestAuthModal(false);
  };

  const register = async (name: string, email: string, password?: string) => {
    const backendUser = await authApi.register(name, email, password);
    setCurrentUser(backendUser);
    setShowGuestAuthModal(false);
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
  };

  const switchToGuest = () => {
    setCurrentUser({
      id: 'guest',
      name: 'Guest Explorer',
      email: '',
      isGuest: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isGuest,
        isLoading,
        login,
        register,
        logout,
        switchToGuest,
        showGuestAuthModal,
        setShowGuestAuthModal,
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
