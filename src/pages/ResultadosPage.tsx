import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function ResultadosPage() {
  const { addRegistro, getParticipante } = useData();
  const { participanteId, isAdmin } = useAuth();
  const participanteAtual = !isAdmin ? getParticipante(participanteId ?? "") : null;
  const [idInput, setIdInput] = useState("");
  const idAlvo = isAdmin ? idInput : participanteId ?? "";
  const [data, setData] = useState("");
  const [viewsTiktok, setViewsTiktok] = useState("");
  const [viewsYoutube, setViewsYoutube] = useState("");
  const [viewsFacebook, setViewsFacebook] = useState("");
  const [cortes, setCortes] = useState("");
  const [links, setLinks] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    const participante = getParticipante(idAlvo.trim());
    if (!participante) {
      setErro("ID de participante não encontrado. Confere o ID.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await addRegistro({
        participanteId: participante.id,
        data,
        viewsTiktok: Number(viewsTiktok) || 0,
        viewsYoutube: Number(viewsYoutube) || 0,
        viewsFacebook: Number(viewsFacebook) || 0,
        cortes: Number(cortes) || 0,
        links,
      });
      setEnviado(true);
      setIdInput("");
      setData("");
      setViewsTiktok("");
      setViewsYoutube("");
      setViewsFacebook("");
      setCortes("");
      setLinks("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar os resultados.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="page">
        <div className="form-card confirmacao">
          <h2>Resultados registados</h2>
          <p className="hint">O ranking foi atualizado automaticamente.</p>
          <button className="btn" onClick={() => setEnviado(false)}>
            Enviar novo resultado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-card">
        <h2>Evento — Registo de Resultados</h2>
        <form onSubmit={submeter}>
          {isAdmin ? (
            <label>
              ID do participante
              <input value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder="VRS001" required />
            </label>
          ) : (
            <p className="hint">
              A enviar resultados como <strong>{participanteAtual?.nome ?? participanteId}</strong> ({participanteId})
            </p>
          )}
          {erro && <p className="erro">{erro}</p>}
          <label>
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </label>
          <label>
            Views TikTok
            <input type="number" value={viewsTiktok} onChange={(e) => setViewsTiktok(e.target.value)} min={0} />
          </label>
          <label>
            Views YouTube
            <input type="number" value={viewsYoutube} onChange={(e) => setViewsYoutube(e.target.value)} min={0} />
          </label>
          <label>
            Views Facebook
            <input type="number" value={viewsFacebook} onChange={(e) => setViewsFacebook(e.target.value)} min={0} />
          </label>
          <label>
            Nº de cortes publicados
            <input type="number" value={cortes} onChange={(e) => setCortes(e.target.value)} min={0} />
          </label>
          <label>
            Links dos cortes (opcional)
            <textarea value={links} onChange={(e) => setLinks(e.target.value)} rows={3} />
          </label>
          <button className="btn" type="submit" disabled={!idAlvo || !data || enviando}>
            {enviando ? "A enviar…" : "Enviar resultados"}
          </button>
        </form>
      </div>
    </div>
  );
}
