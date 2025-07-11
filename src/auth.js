import { supabase } from './supabaseClient'

// Registro de usuario
export async function registrar(email, password) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { user, error }
}

// Login de usuario
export async function login(email, password) {
  const { user, error, session } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { user, error, session }
}

// Cerrar sesión
export async function logout() {
  await supabase.auth.signOut()
}
