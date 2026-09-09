import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-brand">
          <p className="hero-liga">Gestão da Plataforma</p>
          <h1>Administração</h1>
        </div>
      </header>

      <nav className="tabs admin-nav">
        <NavLink to="/admin" end className={({ isActive }) => `tab${isActive ? " active" : ""}`}>
          Painel
        </NavLink>
        <NavLink to="/admin/participantes" className={({ isActive }) => `tab${isActive ? " active" : ""}`}>
          Participantes
        </NavLink>
        <NavLink to="/admin/registos" className={({ isActive }) => `tab${isActive ? " active" : ""}`}>
          Registos
        </NavLink>
        <NavLink to="/admin/configuracoes" className={({ isActive }) => `tab${isActive ? " active" : ""}`}>
          Configurações
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
