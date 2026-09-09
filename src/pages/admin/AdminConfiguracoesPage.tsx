import { useState, type FormEvent } from "react";
import { useData } from "../../context/DataContext";

export default function AdminConfiguracoesPage() {
  const {
    eventoStats,
    updateEventoStats,
    inscricoesAbertas,
    limiteParticipantes,
    inscricoesFechadasManualmente,
    updateConfiguracoes,
    participantes,
  } = useData();

  const [nome, setNome] = useState(eventoStats.nome);
  const [liga, setLiga] = useState(eventoStats.liga);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(eventoStats.ultimaAtualizacao);
  const [limiteInput, setLimiteInput] = useState(limiteParticipantes?.toString() ?? "");
  const [salvandoEvento, setSalvandoEvento] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const guardarEvento = async (e: FormEvent) => {
    e.preventDefault();
    setSalvandoEvento(true);
    setErro(null);
    try {
      await updateEventoStats({ nome, liga, ultimaAtualizacao });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível guardar as alterações.");
    } finally {
      setSalvandoEvento(false);
    }
  };

  const aplicarLimite = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    const valor = Number(limiteInput);
    try {
      await updateConfiguracoes({ limiteParticipantes: limiteInput.trim() === "" || !valor ? null : valor });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível aplicar o limite.");
    }
  };

  const alternarInscricoes = async () => {
    setErro(null);
    try {
      await updateConfiguracoes({ inscricoesFechadasManualmente: !inscricoesFechadasManualmente });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível alterar o estado das inscrições.");
    }
  };

  return (
    <div className="admin-section">
      {erro && <p className="erro">{erro}</p>}

      <div className="admin-section-head">
        <h2>Evento</h2>
      </div>
      <form className="form-card admin-form-card" onSubmit={guardarEvento}>
        <label>
          Nome do evento
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label>
          Liga
          <input value={liga} onChange={(e) => setLiga(e.target.value)} />
        </label>
        <label>
          Última atualização
          <input value={ultimaAtualizacao} onChange={(e) => setUltimaAtualizacao(e.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={salvandoEvento}>
          {salvandoEvento ? "A guardar…" : "Guardar"}
        </button>
      </form>

      <div className="admin-section-head">
        <h2>Inscrições</h2>
      </div>
      <div className="admin-settings">
        <div className="admin-settings-status">
          <span className={`badge${inscricoesAbertas ? "" : " badge-fechado"}`}>
            {inscricoesAbertas ? "Inscrições abertas" : "Inscrições fechadas"}
          </span>
          <span className="hint">{participantes.length} inscritos até agora</span>
        </div>
        <form className="admin-settings-form" onSubmit={aplicarLimite}>
          <label>
            Limite de participantes
            <input
              type="number"
              min={1}
              placeholder="Sem limite"
              value={limiteInput}
              onChange={(e) => setLimiteInput(e.target.value)}
            />
          </label>
          <button className="btn btn-secundario" type="submit">
            Aplicar limite
          </button>
          <button className="btn btn-secundario" type="button" onClick={alternarInscricoes}>
            {inscricoesFechadasManualmente ? "Reabrir inscrições" : "Fechar inscrições agora"}
          </button>
        </form>
      </div>
    </div>
  );
}
