import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockUsers';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email?: string, password?: string) => void;
  register: (name: string, email: string, password?: string) => void;
  logout: () => void;
  switchToGuest: () => void;
  switchToSarah: () => void;
  showGuestAuthModal: boolean;
  setShowGuestAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Sarah Chen (Pro Tier authenticated user) as shown in reference screenshots
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.sarah);
  const [showGuestAuthModal, setShowGuestAuthModal] = useState<boolean>(false);

  const isAuthenticated = !currentUser.isGuest;
  const isGuest = !!currentUser.isGuest;

  const login = (email?: string) => {
    setCurrentUser({
      ...mockUsers.sarah,
      email: email || mockUsers.sarah.email,
    });
    setShowGuestAuthModal(false);
  };

  const register = (name: string, email: string) => {
    setCurrentUser({
      id: `user_${Date.now()}`,
      name: name || 'Sarah Chen',
      email: email || 'user@example.com',
      avatarUrl: mockUsers.sarah.avatarUrl,
      role: 'Product Lead',
      tier: 'PRO TIER',
      isGuest: false,
    });
    setShowGuestAuthModal(false);
  };

  const logout = () => {
    setCurrentUser(mockUsers.guest);
  };

  const switchToGuest = () => {
    setCurrentUser(mockUsers.guest);
  };

  const switchToSarah = () => {
    setCurrentUser(mockUsers.sarah);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isGuest,
        login,
        register,
        logout,
        switchToGuest,
        switchToSarah,
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
