import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde el backend
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => {
        if (!res.ok) throw new Error('No session');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login desde backend
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login inválido');
      }

      const data = await res.json();
      setUser(data);
      setIsAuthenticated(true);

      toast({
        title: 'Inicio de sesión exitoso',
        description: email,
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error de autenticación',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Registro desde backend
  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registro fallido');
      }

      const data = await res.json();
      setUser(data);
      setIsAuthenticated(true);

      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada correctamente',
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error de registro',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Actualizar datos del perfil
  const updateUser = async (updatedData) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error('No se pudo actualizar el perfil');
      const updated = await res.json();
      setUser(updated);

      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se han guardado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Logout local (si usás token persistente deberías invalidarlo en backend)
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
    });
  };

  const value = {
    user,
    isAuthenticated,
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
