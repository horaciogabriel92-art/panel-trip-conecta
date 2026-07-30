"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Superadmin {
  id: string;
  email: string;
  nombre: string;
  rol: "superadmin" | "support";
}

interface ErnestoContextType {
  superadmin: Superadmin | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, superadmin: Superadmin) => void;
  logout: () => void;
  api: import('axios').AxiosInstance;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const ErnestoContext = createContext<ErnestoContextType | undefined>(undefined);

export function ErnestoProvider({ children }: { children: React.ReactNode }) {
  const [superadmin, setSuperadmin] = useState<Superadmin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setSuperadmin(null);
    setToken(null);
    localStorage.removeItem("ernesto_token");
    localStorage.removeItem("ernesto_user");
    delete axios.defaults.headers.common["Authorization"];
    router.push("/ernestosplace/login");
  }, [router]);

  const login = useCallback((newToken: string, newSuperadmin: Superadmin) => {
    setToken(newToken);
    setSuperadmin(newSuperadmin);
    localStorage.setItem("ernesto_token", newToken);
    localStorage.setItem("ernesto_user", JSON.stringify(newSuperadmin));
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    router.push("/ernestosplace");
  }, [router]);

  useEffect(() => {
    const savedToken = localStorage.getItem("ernesto_token");
    const savedUser = localStorage.getItem("ernesto_user");

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setSuperadmin(parsed);
        axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      } catch (e) {
        console.error("Error parsing superadmin from localStorage:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const api = axios.create({
    baseURL: `${API_URL}/ernestosplace`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
      return Promise.reject(err);
    }
  );

  return (
    <ErnestoContext.Provider value={{ superadmin, token, isLoading, login, logout, api }}>
      {children}
    </ErnestoContext.Provider>
  );
}

export function useErnesto() {
  const context = useContext(ErnestoContext);
  if (context === undefined) {
    throw new Error("useErnesto must be used within an ErnestoProvider");
  }
  return context;
}
