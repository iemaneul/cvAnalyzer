import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, AUTH_TOKEN_KEY } from './services/api';

export interface User { id: string; name: string; email: string }
interface AuthResponse { user: User; token: string }
interface AuthContextValue {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return;
    api.get<{ data: User }>('/auth/me').then(({ data }) => setUser(data.data)).catch(() => localStorage.removeItem(AUTH_TOKEN_KEY)).finally(() => setLoading(false));
  }, []);

  const acceptSession = ({ user: nextUser, token }: AuthResponse) => {
    queryClient.clear(); localStorage.setItem(AUTH_TOKEN_KEY, token); setUser(nextUser);
  };
  const login = async (email: string, password: string) => acceptSession((await api.post<{ data: AuthResponse }>('/auth/login', { email, password })).data.data);
  const register = async (name: string, email: string, password: string) => acceptSession((await api.post<{ data: AuthResponse }>('/auth/register', { name, email, password })).data.data);
  const logout = () => { localStorage.removeItem(AUTH_TOKEN_KEY); queryClient.clear(); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
