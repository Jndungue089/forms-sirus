import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";

export default function InscricaoPage() {
  const { addParticipante } = useData();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [aceitaRegras, setAceitaRegras] = useState(false);
  const [idGerado, setIdGerado] = useState<string | null>(null);

  const submeter = (e: FormEvent) => {
    e.preventDefault();
    if (!nome || !idade || !aceitaRegras) return;
    const id = addParticipante({
      nome,
      idade: Number(idade),
      tiktok,
      youtube,
      whatsapp,
    });
    setIdGerado(id);
    setNome("");
    setIdade("");
    setTiktok("");
    setYoutube("");
    setWhatsapp("");
    setAceitaRegras(false);
  };

  if (idGerado) {
    return (
      <div className="page">
        <div className="form-card confirmacao">
          <h2>Inscrição confirmada</h2>
          <p>O teu ID de participante é:</p>
          <p className="id-gerado">{idGerado}</p>
          <p className="hint">Guarda este ID — vais precisar dele para enviar os teus resultados.</p>
          <button className="btn" onClick={() => setIdGerado(null)}>
            Nova inscrição
          </button>
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
            Número de WhatsApp
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={aceitaRegras} onChange={(e) => setAceitaRegras(e.target.checked)} />
            Confirmo que li as regras
          </label>
          <button className="btn" type="submit" disabled={!nome || !idade || !aceitaRegras}>
            Enviar inscrição
          </button>
        </form>
      </div>
    </div>
  );
}
