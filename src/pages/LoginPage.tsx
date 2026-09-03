import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const submeter = (e: FormEvent) => {
    e.preventDefault();
    if (login(id.trim())) {
      navigate("/area");
    } else {
      setErro("ID não encontrado. Confere o teu ID de inscrição (ex: VRS001).");
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <h2>Entrar</h2>
        <form onSubmit={submeter}>
          <label>
            ID do participante
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="VRS001" required />
          </label>
          {erro && <p className="erro">{erro}</p>}
          <button className="btn" type="submit" disabled={!id}>
            Entrar
          </button>
        </form>
        <p className="hint">Acesso do MVP: basta o ID recebido na inscrição, sem senha.</p>
      </div>
    </div>
  );
}
