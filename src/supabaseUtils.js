import { supabase } from './supabaseClient'

// Registrar una operación y actualizar balance
export async function registrarOperacion({ userId, type, amount, price }) {
  const { error: insertError } = await supabase.from('trades').insert([
    {
      user_id: userId,
      type,
      amount,
      price
    }
  ])
  if (insertError) throw insertError

  const { data: balanceData, error: balanceError } = await supabase
    .from('balances')
    .select('balance')
    .eq('user_id', userId)
    .single()
  if (balanceError) throw balanceError

  let nuevoBalance = balanceData.balance
  if (type === 'buy') {
    nuevoBalance -= amount * price
  } else if (type === 'sell') {
    nuevoBalance += amount * price
  }

  const { error: updateError } = await supabase
    .from('balances')
    .update({ balance: nuevoBalance })
    .eq('user_id', userId)
  if (updateError) throw updateError
}

// Obtener balance
export async function obtenerBalance(userId) {
  const { data, error } = await supabase
    .from('balances')
    .select('balance, demo_balance')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

// Actualizar balance directo
export async function actualizarBalance(userId, nuevoBalance) {
  const { error } = await supabase
    .from('balances')
    .update({ balance: nuevoBalance })
    .eq('user_id', userId)
  if (error) throw error
}

// Obtener historial de operaciones
export async function obtenerHistorial(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data
}
export async function obtenerPerfil(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, referred_by')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

