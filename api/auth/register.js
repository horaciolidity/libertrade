
export default function handler(req, res) {
  const { email, password } = req.body;
  return res.status(200).json({ message: 'Usuario registrado (simulado)' });
}
