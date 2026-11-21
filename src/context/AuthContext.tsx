import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/learning';
import { DEMO_STUDENT_USER, DEMO_TEACHER_USER } from '../data/syllabus';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  isLoading: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  login: (role: Role, customName?: string) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (targetRole: Role) => Promise<void>;
  canAccessRoute: (route: string, targetRole?: Role | null) => boolean;
  getDefaultRouteForRole: (role: Role | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'learnflow_auth_user_v1';

// Student allowed routes
const STUDENT_ROUTES = new Set([
  'dashboard',
  'intelligence-center',
  'learning-journey',
  'confidence-analysis',
  'diagnostic',
  'concept-map',
  'practice',
  'revision',
  'misconceptions',
  'learn',
  'progress',
  'teach-back',
  'socratic',
  'concept-rescue',
]);

// Teacher allowed routes
const TEACHER_ROUTES = new Set([
  'teacher-overview',
  'teacher-analytics',
  'teacher-students',
  'teacher-heatmap',
  'teacher-misconceptions',
  'teacher-alerts',
  'teacher-labs',
  'teacher-reports',
  // Shared/common
  'concept-map',
  'misconceptions',
]);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved auth user:', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAuthenticated = !!user;
  const role = user?.role || null;
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';

  const login = async (selectedRole: Role, customName?: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Attempt backend auth route with fallback to local demo models
      let authUser: User;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: selectedRole, customName }),
        });

        if (res.ok) {
          const data = await res.json();
          authUser = data.user;
        } else {
          throw new Error('Backend auth response was not ok');
        }
      } catch (networkErr) {
        // Fallback to local demo profile
        const base = selectedRole === 'teacher' ? DEMO_TEACHER_USER : DEMO_STUDENT_USER;
        authUser = customName
          ? { ...base, name: customName, id: `user-${Date.now()}` }
          : base;
      }

      // Small realistic async delay for smooth UX transition
      await new Promise((resolve) => setTimeout(resolve, 450));

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchDemoAccount = async (targetRole: Role): Promise<void> => {
    await login(targetRole);
  };

  const canAccessRoute = (route: string, testRole?: Role | null): boolean => {
    const currentRole = testRole !== undefined ? testRole : role;
    if (!currentRole) return false;

    if (currentRole === 'student') {
      return STUDENT_ROUTES.has(route);
    }

    if (currentRole === 'teacher') {
      return TEACHER_ROUTES.has(route) || route.startsWith('teacher-');
    }

    return false;
  };

  const getDefaultRouteForRole = (currentRole: Role | null): string => {
    if (currentRole === 'teacher') {
      return 'teacher-overview';
    }
    return 'dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        isLoading,
        isStudent,
        isTeacher,
        login,
        logout,
        switchDemoAccount,
        canAccessRoute,
        getDefaultRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
