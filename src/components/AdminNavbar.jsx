import { Link } from "react-router-dom";

function AdminNavbar() {
  return (
    <nav className="mb-4">
      <Link to="/admin/dashboard" className="mr-4 text-blue-600 font-semibold">Panel Principal</Link>
      {/* Aquí podés agregar más secciones si hacés crecer el panel */}
    </nav>
  );
}

export default AdminNavbar;
