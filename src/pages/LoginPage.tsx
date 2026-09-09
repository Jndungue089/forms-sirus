import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
      const isAdmin = await login(id.trim(), senha);
      navigate(isAdmin ? "/admin" : "/area");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "ID ou senha incorretos. Confere os teus dados de acesso.");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <h2>Entrar</h2>
        <form onSubmit={submeter}>
          <label>
            ID do participante
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="VRS001"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="A tua senha"
              required
            />
          </label>
          {erro && <p className="erro">{erro}</p>}
          <button className="btn" type="submit" disabled={!id || !senha || entrando}>
            {entrando ? "A entrar…" : "Entrar"}
          </button>
        </form>
        <p className="hint">
          <strong>Participantes demo:</strong> <code>VRS001</code> a <code>VRS008</code> | Senha <code>123</code>
        </p>
        <p className="hint">
          Ainda não estás inscrito? <Link to="/inscricao">Faz a tua inscrição</Link>.
        </p>
      </div>
    </div>
  );
}
