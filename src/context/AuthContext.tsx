"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export interface UserPermissions {
  ver_todas_cotizaciones?: boolean;
  ver_todas_ventas?: boolean;
  ver_reportes?: boolean;
  gestionar_paquetes?: boolean;
  ver_comisiones_otros?: boolean;
  editar_clientes_otros?: boolean;
}

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'vendedor';
  tenant_id?: string;
  comision_porcentaje?: number;
  telefono?: string;
  preferencias?: {
    pdf_colors?: Record<string, string>;
  };
  permisos?: UserPermissions;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 AuthContext: Loading from localStorage...');
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('🔍 Token exists:', !!savedToken);
    console.log('🔍 User exists:', !!savedUser);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ AuthContext: User loaded:', parsedUser);
        setToken(savedToken);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        console.error('❌ Error parsing user:', e);
      }
    } else {
      console.log('⚠️ No token or user found in localStorage');
    }
    setIsLoading(false);
  }, []);

  const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
    if (!user) return false;
    if (user.rol === 'admin') return true;
    return user.permisos?.[permission] === true;
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/profile`);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    console.log('🔐 Login called with user:', newUser);
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    console.log('🚀 Redirecting to:', newUser.rol === 'admin' ? '/admin' : '/dashboard');
    if (newUser.rol === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, hasPermission, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
