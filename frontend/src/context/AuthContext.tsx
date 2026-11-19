import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'patient' | 'clinician';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  savedConditions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  loginAsDemo: (role?: UserRole) => void;
  logout: () => void;
  updateConditions: (conditions: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'medsafe_india_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [user]);

  const login = (profile: UserProfile) => {
    setUser(profile);
  };

  const loginAsDemo = (role: UserRole = 'patient') => {
    if (role === 'clinician') {
      setUser({
        name: 'Dr. R. Shenoy, MD',
        email: 'dr.shenoy@citycare-clinic.in',
        role: 'clinician',
        savedConditions: [],
      });
    } else {
      setUser({
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@demo.in',
        role: 'patient',
        age: 58,
        savedConditions: ['Gastric Ulcer'],
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateConditions = (conditions: string[]) => {
    setUser((prev) => (prev ? { ...prev, savedConditions: conditions } : null));
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsDemo, logout, updateConditions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};