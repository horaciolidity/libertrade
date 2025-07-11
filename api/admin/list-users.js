
export default function handler(req, res) {
  return res.status(200).json({ users: [{ email: 'user@vault.com', realBalance: 1000 }] });
}
