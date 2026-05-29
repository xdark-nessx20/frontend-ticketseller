import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { decodeToken, isTokenExpired, type JwtPayload } from './jwt';
import { getToken, saveToken, removeToken } from './tokenStorage';

interface AuthContextType {
  usuario: JwtPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = getToken();
    return t && !isTokenExpired(t) ? t : null;
  });

  const usuario = token ? decodeToken(token) : null;

  const login = (newToken: string) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    removeToken();
    setToken(null);
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
