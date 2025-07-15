// api/auth/register.js
import { supabase } from '../../src/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn("Método no permitido:", req.method);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password, name, referralCode } = req.body;
  console.log("📩 Registro iniciado:", email);

  // 1. Crear cuenta en Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error("❌ Error en Supabase Auth:", signUpError.message);
    return res.status(400).json({ error: signUpError.message });
  }

  const user = signUpData.user;
  if (!user) {
    console.error("❌ No se obtuvo el usuario después de registrarse.");
    return res.status(400).json({ error: 'No se pudo crear el usuario' });
  }

  // 2. Buscar ID del usuario que refirió (si existe)
  let referredByUserId = null;
  if (referralCode) {
    console.log("🔗 Buscando referido:", referralCode);
    const { data: refData, error: refError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', referralCode)
      .single();

    if (!refError && refData) {
      referredByUserId = refData.id;
      console.log("✅ Referido encontrado:", referredByUserId);
    } else {
      console.warn("⚠️ Referido no encontrado o error:", refError?.message);
    }
  }

  // 3. Crear perfil
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    name: name || '',
    referred_by: referredByUserId
  });

  if (profileError) {
    console.error("❌ Error al crear perfil:", profileError.message);
    return res.status(500).json({ error: 'Usuario creado, pero falló el perfil: ' + profileError.message });
  }

  console.log("✅ Perfil creado correctamente");

  // 4. Crear saldo inicial con bono
  const bonoReal = referredByUserId ? 10 : 0;

  const { error: balanceError } = await supabase.from('balances').insert({
    user_id: user.id,
    balance: bonoReal,
    demo_balance: 10000
  });

  if (balanceError) {
    console.error("❌ Error al crear balance:", balanceError.message);
    return res.status(500).json({ error: 'Perfil creado, pero falló crear saldos: ' + balanceError.message });
  }

  console.log("💰 Balance creado. Bono real:", bonoReal);

  // 5. Pagarle al referente si existe
  if (referredByUserId) {
    const { data: currentReferrerBalance, error: refBalErr } = await supabase
      .from('balances')
      .select('balance')
      .eq('user_id', referredByUserId)
      .single();

    if (!refBalErr && currentReferrerBalance) {
      const nuevoSaldo = Number(currentReferrerBalance.balance) + 5;
      const { error: updateError } = await supabase
        .from('balances')
        .update({ balance: nuevoSaldo })
        .eq('user_id', referredByUserId);

      if (updateError) {
        console.warn("⚠️ Error al actualizar balance del referido:", updateError.message);
      } else {
        console.log("✅ Referido bonificado con +5");
      }
    } else {
      console.warn("⚠️ No se pudo obtener el balance del referido:", refBalErr?.message);
    }
  }

  return res.status(200).json({ message: 'Usuario registrado con éxito' });
}
