"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "meteora:user";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch (error) {
      console.error("Erro ao ler usuário:", error);
    }
    setHydrated(true);
  }, []);

  // ⚠️ Auth MOCKADA (apenas demo): aceita qualquer e-mail/senha válidos.
  // Não há verificação real — não use em produção.
  const login = useCallback(async ({ email, password, name }) => {
    const cleanEmail = (email ?? "").trim();

    if (!cleanEmail || !password) {
      throw new Error("Informe e-mail e senha.");
    }

    const derivedName = (name ?? "").trim() || cleanEmail.split("@")[0];
    const nextUser = { name: derivedName, email: cleanEmail };

    setUser(nextUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }

    return nextUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hydrated,
    }),
    [user, login, logout, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
