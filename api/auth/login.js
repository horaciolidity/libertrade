
export default function handler(req, res) {
  const { email, password } = req.body;
  // Validación simulada
  if (email === 'admin@vault.com' && password === 'admin123') {
    return res.status(200).json({ role: 'admin', token: 'fake-admin-token' });
  }
  if (email === 'user@vault.com' && password === 'user123') {
    return res.status(200).json({ role: 'user', token: 'fake-user-token' });
  }
  return res.status(401).json({ error: 'Credenciales incorrectas' });
}
