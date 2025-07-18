// api/auth/register.js
import { createClient } from '@supabase/supabase-js';

// ✅ Usa variables de entorno para tu Supabase Service Role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 👈 usa la service key acá, no la pública
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  try {
    const { email, password, name, referralCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    console.log("📩 Registro iniciado:", email);

    // 1. Crear cuenta en Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (signUpError) {
      console.error("❌ Error al crear usuario:", signUpError.message);
      return res.status(400).json({ error: signUpError.message });
    }

    const user = signUpData.user;

    if (!user) {
      console.error("❌ Usuario no creado");
      return res.status(400).json({ error: 'No se pudo crear el usuario' });
    }

    // 2. Verificar referido (si existe)
    let referredByUserId = null;

    if (referralCode) {
      const { data: refData, error: refError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode) // 👈 Cambia aquí si usás otro campo
        .single();

      if (refData) {
        referredByUserId = refData.id;
        console.log("✅ Referido válido:", referredByUserId);
      } else {
        console.warn("⚠️ Código de referido inválido");
      }
    }

    // 3. Crear perfil
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      name: name || '',
      referred_by: referredByUserId,
      referral_code: generateReferralCode(), // 👈 útil generar un código propio
    });

    if (profileError) {
      return res.status(500).json({ error: 'Error al crear perfil: ' + profileError.message });
    }

    // 4. Crear balance
    const bonoReal = referredByUserId ? 10 : 0;
    const { error: balanceError } = await supabase.from('balances').insert({
      user_id: user.id,
      balance: bonoReal,
      demo_balance: 10000,
    });

    if (balanceError) {
      return res.status(500).json({ error: 'Error al crear balance: ' + balanceError.message });
    }

    // 5. Bonificar al referido si aplica
    if (referredByUserId) {
      const { data: currentReferrer, error: refBalErr } = await supabase
        .from('balances')
        .select('balance')
        .eq('user_id', referredByUserId)
        .single();

      if (currentReferrer) {
        const nuevoSaldo = Number(currentReferrer.balance) + 5;
        await supabase
          .from('balances')
          .update({ balance: nuevoSaldo })
          .eq('user_id', referredByUserId);
        console.log("💸 Referido bonificado");
      }
    }

    return res.status(200).json({ message: 'Usuario registrado con éxito' });

  } catch (err) {
    console.error("❌ Error inesperado:", err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función auxiliar para generar código de referido único
function generateReferralCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
