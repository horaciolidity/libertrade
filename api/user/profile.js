
export default function handler(req, res) {
  return res.status(200).json({ email: 'user@vault.com', demoBalance: 5000, realBalance: 0 });
}
