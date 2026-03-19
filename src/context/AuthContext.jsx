// src/context/AuthContext.jsx
// Contexto global de autenticação
// Expõe: user, token, login(), logout(), isAuthenticated, isAdmin, isEditor

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // verifica sessão ao iniciar

  // Restaura sessão do localStorage ao montar
  useEffect(() => {
    const token = localStorage.getItem('germinapedia:token');
    const savedUser = localStorage.getItem('germinapedia:user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Valida com o servidor em background (não bloqueia UI)
        authApi.profile()
          .then((profile) => setUser(profile))
          .catch(() => logout()); // token expirado
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('germinapedia:token', data.accessToken);
    localStorage.setItem('germinapedia:user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    localStorage.setItem('germinapedia:token', data.accessToken);
    localStorage.setItem('germinapedia:user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('germinapedia:token');
    localStorage.removeItem('germinapedia:user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isEditor: user?.role === 'EDITOR' || user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
