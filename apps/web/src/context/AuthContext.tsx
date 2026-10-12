"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  email: string;
  full_name: string;
  role: "OPERATOR" | "MANAGER" | "ADMIN";
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Rehydrate token and user from localStorage on mount
    try {
      const storedToken = localStorage.getItem("xcc_auth_token");
      const storedUser = localStorage.getItem("xcc_auth_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to rehydrate session", e);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("xcc_auth_token", newToken);
    localStorage.setItem("xcc_auth_user", JSON.stringify(newUser));
    setIsModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("xcc_auth_token");
    localStorage.removeItem("xcc_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        isModalOpen,
        openLoginModal: () => setIsModalOpen(true),
        closeLoginModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
