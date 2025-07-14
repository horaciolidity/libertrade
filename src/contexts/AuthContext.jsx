import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Error de autenticación',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    setUser(data.user);
    toast({
      title: 'Inicio de sesión exitoso',
      description: email,
    });
  };

  const register = async ({ email, password, name, referralCode }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, referralCode })
    });

    const data = await response.json();

    if (!response.ok) {
      toast({
        title: 'Error al registrar',
        description: data.error || 'Ocurrió un error',
        variant: 'destructive'
      });
      throw new Error(data.error);
    }

    toast({
      title: 'Registro exitoso',
      description: email
    });

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw loginError;
    setUser(loginData.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
    });
  };

  const updateUser = async (updatedData) => {
    toast({
      title: 'No implementado',
      description: 'Actualización de perfil no disponible en esta versión',
      variant: 'destructive',
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
