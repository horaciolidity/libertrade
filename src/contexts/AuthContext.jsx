import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast({
        title: 'Error de autenticación',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    setUser(data.user)
    toast({
      title: 'Inicio de sesión exitoso',
      description: email,
    })
  }

 const register = async ({ email, password, name, referredBy }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    toast({
      title: 'Error de registro',
      description: error.message,
      variant: 'destructive',
    })
    throw error
  }

  const user = data.user
  setUser(user)

  // Crear perfil
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: user.id,
      name,
      referred_by: referredBy || null
    }
  ])

  if (profileError) {
    console.error('Error al guardar perfil:', profileError)
  }

  // Crear saldo inicial
  const { error: balanceError } = await supabase.from('balances').insert([
    {
      user_id: user.id,
      balance: 0,
      demo_balance: 10000
    }
  ])

  if (balanceError) {
    console.error('Error al crear balance:', balanceError)
  }

  toast({
    title: 'Registro exitoso',
    description: 'Tu cuenta ha sido creada correctamente',
  })
}
export async function obtenerBalance(userId) {
  const { data, error } = await supabase
    .from('balances')
    .select('balance, demo_balance')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}
export async function actualizarBalance(userId, nuevoBalance) {
  const { error } = await supabase
    .from('balances')
    .update({ balance: nuevoBalance })
    .eq('user_id', userId)

  if (error) throw error
}



  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
    })
  }

  const updateUser = async (updatedData) => {
    // Supabase Auth no permite actualizar todo, esto es un placeholder
    toast({
      title: '⚠️ No implementado',
      description: 'Actualización de perfil no disponible en esta versión',
      variant: 'destructive',
    })
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
