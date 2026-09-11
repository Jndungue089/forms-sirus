import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export default function Layout() {
  const { participanteId, isAdmin, logout } = useAuth();
  const { loading, error, bloqueioTotal } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const bloqueado = bloqueioTotal && !isAdmin && location.pathname !== "/login";

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
          {participanteId ? (
            <>
              <NavLink to="/resultados">Enviar Resultados</NavLink>
              {isAdmin ? (
                <NavLink to="/admin">Administração</NavLink>
              ) : (
                <NavLink to="/area">Minha Área</NavLink>
              )}
              <button className="link-button" onClick={sair}>
                Sair ({participanteId})
              </button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </div>
      </nav>
      {loading ? (
        <div className="page">
          <p className="hint centro">A carregar dados do servidor…</p>
        </div>
      ) : error ? (
        <div className="page">
          <div className="form-card confirmacao">
            <h2>Não foi possível ligar ao servidor</h2>
            <p className="hint">{error}</p>
            <p className="hint">Confirma que o backend está a correr (npm run start em /server).</p>
          </div>
        </div>
      ) : bloqueado ? (
        <div className="page">
          <div className="lockdown-screen">
            <header className="hero">
              <div className="hero-brand">
                <p className="hero-liga">Liga de Cortes</p>
                <h1>Resultados em breve</h1>
              </div>
            </header>
            <p className="hint centro">
              A plataforma está temporariamente indisponível enquanto preparamos a revelação final. Volta em breve!
            </p>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
