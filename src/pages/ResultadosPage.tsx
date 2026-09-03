import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";

export default function ResultadosPage() {
  const { addRegistro, getParticipante } = useData();
  const [id, setId] = useState("");
  const [data, setData] = useState("");
  const [viewsTiktok, setViewsTiktok] = useState("");
  const [viewsYoutube, setViewsYoutube] = useState("");
  const [cortes, setCortes] = useState("");
  const [links, setLinks] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const submeter = (e: FormEvent) => {
    e.preventDefault();
    const participante = getParticipante(id.trim());
    if (!participante) {
      setErro("ID de participante não encontrado. Confere o teu ID de inscrição.");
      return;
    }
    setErro(null);
    addRegistro({
      id: participante.id,
      data,
      viewsTiktok: Number(viewsTiktok) || 0,
      viewsYoutube: Number(viewsYoutube) || 0,
      cortes: Number(cortes) || 0,
      links,
    });
    setEnviado(true);
    setId("");
    setData("");
    setViewsTiktok("");
    setViewsYoutube("");
    setCortes("");
    setLinks("");
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
          <label>
            ID do participante
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="VRS001" required />
          </label>
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
            Nº de cortes publicados
            <input type="number" value={cortes} onChange={(e) => setCortes(e.target.value)} min={0} />
          </label>
          <label>
            Links dos cortes (opcional)
            <textarea value={links} onChange={(e) => setLinks(e.target.value)} rows={3} />
          </label>
          <button className="btn" type="submit" disabled={!id || !data}>
            Enviar resultados
          </button>
        </form>
      </div>
    </div>
  );
}
