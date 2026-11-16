import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AuthContext = createContext(null);

// Dispatch this from your fetch/axios wrapper when the API returns 401:
//   window.dispatchEvent(new Event('auth:expired'));
export const AUTH_EXPIRED_EVENT = 'auth:expired';

function readStoredUser() {
  try {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) return null;
    return JSON.parse(savedUser);
  } catch {
    // Corrupted storage: clear it instead of crashing the app on load
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on page refresh
  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Log out when the API says the token is expired/invalid
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  // Keep tabs in sync: logging out (or in) in one tab updates the others
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === null) {
        setUser(readStoredUser());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, loading, updateUser }),
    [user, login, logout, loading, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook for clean imports in components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
