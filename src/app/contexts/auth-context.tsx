import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi, setTokens, clearTokens } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ requiresEmailVerification: boolean; email: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  resendVerificationOtp: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response: any = await authApi.getProfile();
        if (response.success && response.data) {
          setUser({
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role.toLowerCase() as 'user' | 'admin',
            joinDate: response.data.joinDate,
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear tokens if they're invalid
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    // Only load user if we have a token
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role.toLowerCase() as 'user' | 'admin',
          joinDate: userData.joinDate,
        });

        setTokens(tokens.accessToken, tokens.refreshToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearTokens();
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response: any = await authApi.register({ name, email, password });

      if (response.success && response.data) {
        return {
          requiresEmailVerification: Boolean(response.data.requiresEmailVerification),
          email: response.data.user?.email || email,
        };
      }

      throw new Error(response?.message || 'Registration failed');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    const response: any = await authApi.verifyEmailOtp({ email, otp });
    if (!response?.success || !response?.data?.tokens || !response?.data?.user) {
      throw new Error(response?.message || 'OTP verification failed');
    }

    const { user: userData, tokens } = response.data;
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role.toLowerCase() as 'user' | 'admin',
      joinDate: userData.joinDate,
    });
    setTokens(tokens.accessToken, tokens.refreshToken);
  };

  const resendVerificationOtp = async (email: string) => {
    const response: any = await authApi.resendVerificationOtp(email);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to resend OTP');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        register,
        verifyEmailOtp,
        resendVerificationOtp,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
