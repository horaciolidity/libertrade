
export default function handler(req, res) {
  const { email, amount } = req.body;
  return res.status(200).json({ message: `Saldo de $${amount} cargado al usuario ${email}` });
}
