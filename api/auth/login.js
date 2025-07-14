
// api/auth/login.js
import { supabase } from '../../src/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  // Intentar iniciar sesión con Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    return res.status(401).json({ error: error?.message || 'Credenciales incorrectas' });
  }

  return res.status(200).json({ user: data.user });
}
