
export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ realBalance: 1000 });
  }
  if (req.method === 'POST') {
    return res.status(200).json({ message: 'Saldo cargado correctamente' });
  }
}
