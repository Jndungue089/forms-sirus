import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function InscricaoPage() {
  const { addParticipante, inscricoesAbertas } = useData();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [aceitaRegras, setAceitaRegras] = useState(false);
  const [idGerado, setIdGerado] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome || !idade || !aceitaRegras || !senha) return;
    if (senha.length < 3) {
      setErroSenha("A senha deve ter pelo menos 3 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
    setErroSenha(null);
    setErroEnvio(null);
    setEnviando(true);
    try {
      const id = await addParticipante({
        nome,
        idade: Number(idade),
        tiktok,
        youtube,
        facebook,
        senha,
      });
      setIdGerado(id);
      setNome("");
      setIdade("");
      setTiktok("");
      setYoutube("");
      setFacebook("");
      setSenha("");
      setConfirmarSenha("");
      setAceitaRegras(false);
    } catch (err) {
      setErroEnvio(err instanceof Error ? err.message : "Não foi possível concluir a inscrição.");
    } finally {
      setEnviando(false);
    }
  };

  if (!inscricoesAbertas) {
    return (
      <div className="page">
        <div className="form-card confirmacao">
          <h2>Inscrições encerradas</h2>
          <p className="hint">O número de vagas para esta edição já foi atingido. Fica atento às próximas temporadas.</p>
        </div>
      </div>
    );
  }

  if (idGerado) {
    return (
      <div className="page">
        <div className="form-card confirmacao">
          <h2>Inscrição confirmada</h2>
          <p>O teu ID de participante é:</p>
          <p className="id-gerado">{idGerado}</p>
          <p className="hint">Guarda o teu ID e a tua senha — vais precisar deles para aceder à tua área e enviar resultados.</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <Link to="/login" className="btn" style={{ textDecoration: "none", textAlign: "center" }}>
              Ir para o Login
            </Link>
            <button className="btn btn-secundario" onClick={() => setIdGerado(null)}>
              Nova inscrição
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-card">
        <h2>Evento — Inscrição</h2>
        <form onSubmit={submeter}>
          <label>
            Nome completo
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
          <label>
            Idade
            <input type="number" value={idade} onChange={(e) => setIdade(e.target.value)} required min={1} />
          </label>
          <label>
            @TikTok
            <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@usuario" />
          </label>
          <label>
            @YouTube
            <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="@usuario" />
          </label>
          <label>
            @Facebook
            <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="@usuario" />
          </label>
          <label>
            Senha de acesso
            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (erroSenha) setErroSenha(null);
              }}
              placeholder="Cria uma senha"
              required
              minLength={3}
            />
          </label>
          <label>
            Confirmar senha
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => {
                setConfirmarSenha(e.target.value);
                if (erroSenha) setErroSenha(null);
              }}
              placeholder="Confirma a tua senha"
              required
              minLength={3}
            />
          </label>
          {erroSenha && <p className="erro">{erroSenha}</p>}
          {erroEnvio && <p className="erro">{erroEnvio}</p>}
          <label className="checkbox">
            <input type="checkbox" checked={aceitaRegras} onChange={(e) => setAceitaRegras(e.target.checked)} />
            Confirmo que li as regras
          </label>
          <button
            className="btn"
            type="submit"
            disabled={!nome || !idade || !aceitaRegras || !senha || !confirmarSenha || enviando}
          >
            {enviando ? "A enviar…" : "Enviar inscrição"}
          </button>
        </form>
      </div>
    </div>
  );
}
