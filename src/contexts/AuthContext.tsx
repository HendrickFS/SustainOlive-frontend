import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/usersApi';
import type { UserProfile } from '../api/usersApi';

// Define the shape of our auth context
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_KEY = 'auth_token';

  // Login with email and password using backend API
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await apiLogin(email, password);
      // apiLogin returns { token, user }
      const t = resp.token;
      const u = resp.user;
      // persist token for subsequent API calls
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setUser(u);
    } finally {
      setLoading(false);
    }
  };

  // Logout via backend and clear local state
  const logout = async () => {
    setLoading(true);
    try {
      const t = token ?? localStorage.getItem(TOKEN_KEY);
      if (t) {
        try {
          await apiLogout(t);
        } catch (err) {
          // ignore logout errors but proceed to clear local state
          // console.error('logout error', err);
        }
      }
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize from stored token
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (!t) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const u = await getCurrentUser(t);
        if (mounted) {
          setToken(t);
          setUser(u);
        }
      } catch (err) {
        // Token invalid or request failed: clear stored token
        localStorage.removeItem(TOKEN_KEY);
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
