import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { participanteId, logout } = useAuth();
  const navigate = useNavigate();

  const sair = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="shell">
      <nav className="topnav">
        <span className="brand">Liga de Cortes</span>
        <div className="links">
          <NavLink to="/" end>
            Ranking
          </NavLink>
          <NavLink to="/inscricao">Inscrição</NavLink>
          <NavLink to="/resultados">Enviar Resultados</NavLink>
          {participanteId ? (
            <>
              <NavLink to="/area">Minha Área</NavLink>
              <button className="link-button" onClick={sair}>
                Sair ({participanteId})
              </button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
