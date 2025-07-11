
export default function handler(req, res) {
  const { type, amount, price } = req.body;
  return res.status(200).json({ message: 'Operación registrada', type, amount, price });
}
