import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.token) {
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      if (payload.role === "admin") {
        localStorage.setItem("token", data.token);
        navigate("/admin/dashboard");
      } else {
        alert("No sos administrador");
      }
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Login Admin</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-2 mt-4">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2" />
        <button type="submit" className="bg-blue-600 text-white p-2">Entrar</button>
      </form>
    </div>
  );
}

export default AdminLogin;
