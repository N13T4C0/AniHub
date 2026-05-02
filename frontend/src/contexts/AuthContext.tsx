"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User, getStoredUser, setStoredUser, getToken, setToken,
  removeToken, apiLogin, apiRegister,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    const stored = getStoredUser();
    const storedToken = getToken();
    if (stored && storedToken) {
      setUser(stored);
      setTokenState(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
    setStoredUser(data.user);
    setUser(data.user);
    setTokenState(data.access_token);
  };

  const register = async (email: string, username: string, password: string) => {
    const data = await apiRegister(email, username, password);
    setToken(data.access_token);
    setStoredUser(data.user);
    setUser(data.user);
    setTokenState(data.access_token);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
