import { useState, type FormEvent } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminConfiguracoesPage() {
  const {
    eventoStats,
    updateEventoStats,
    inscricoesAbertas,
    limiteParticipantes,
    inscricoesFechadasManualmente,
    ocultarTop3,
    bloqueioTotal,
    updateConfiguracoes,
    participantes,
  } = useData();
  const { alterarSenhaAdmin } = useAuth();

  const [nome, setNome] = useState(eventoStats.nome);
  const [liga, setLiga] = useState(eventoStats.liga);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(eventoStats.ultimaAtualizacao);
  const [limiteInput, setLimiteInput] = useState(limiteParticipantes?.toString() ?? "");
  const [salvandoEvento, setSalvandoEvento] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [sucessoSenha, setSucessoSenha] = useState<string | null>(null);

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

  const alternarOcultarTop3 = async () => {
    setErro(null);
    try {
      await updateConfiguracoes({ ocultarTop3: !ocultarTop3 });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível alterar a ocultação do Top 3.");
    }
  };

  const alternarBloqueioTotal = async () => {
    setErro(null);
    try {
      await updateConfiguracoes({ bloqueioTotal: !bloqueioTotal });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível alterar o bloqueio de acesso.");
    }
  };

  const guardarSenhaAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setErroSenha(null);
    setSucessoSenha(null);

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setErroSenha("Preenche todos os campos.");
      return;
    }
    if (novaSenha.length < 3) {
      setErroSenha("A nova senha deve ter pelo menos 3 caracteres.");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
    if (senhaAtual === novaSenha) {
      setErroSenha("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setSalvandoSenha(true);
    try {
      await alterarSenhaAdmin(senhaAtual, novaSenha);
      setSucessoSenha("Senha de administrador alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    } catch (err) {
      setErroSenha(err instanceof Error ? err.message : "Não foi possível alterar a senha.");
    } finally {
      setSalvandoSenha(false);
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

      <div className="admin-section-head">
        <h2>Suspense da Revelação</h2>
      </div>
      <div className="admin-settings-stack">
        <div className="admin-settings">
          <div className="admin-settings-status">
            <span className={`badge${ocultarTop3 ? " badge-fechado" : ""}`}>
              {ocultarTop3 ? "Top 3 oculto" : "Top 3 visível"}
            </span>
            <span className="hint">Esconde o nome e os números do Top 3 no painel público (Ranking e Registos).</span>
          </div>
          <button className="btn btn-secundario" type="button" onClick={alternarOcultarTop3}>
            {ocultarTop3 ? "Revelar Top 3" : "Ocultar Top 3"}
          </button>
        </div>
        <div className="admin-settings">
          <div className="admin-settings-status">
            <span className={`badge${bloqueioTotal ? " badge-fechado" : ""}`}>
              {bloqueioTotal ? "Plataforma bloqueada" : "Plataforma acessível"}
            </span>
            <span className="hint">Bloqueia o acesso de todos exceto a administração, até desativares esta opção.</span>
          </div>
          <button className="btn btn-secundario" type="button" onClick={alternarBloqueioTotal}>
            {bloqueioTotal ? "Reabrir plataforma" : "Bloquear plataforma"}
          </button>
        </div>
      </div>

      <div className="admin-section-head">
        <h2>Segurança</h2>
      </div>
      <form className="form-card admin-form-card" onSubmit={guardarSenhaAdmin}>
        <label>
          Senha atual
          <input
            type="password"
            placeholder="A tua senha atual"
            value={senhaAtual}
            onChange={(e) => {
              setSenhaAtual(e.target.value);
              if (erroSenha) setErroSenha(null);
              if (sucessoSenha) setSucessoSenha(null);
            }}
            required
          />
        </label>
        <label>
          Nova senha
          <input
            type="password"
            placeholder="Nova senha (mínimo de 3 caracteres)"
            value={novaSenha}
            onChange={(e) => {
              setNovaSenha(e.target.value);
              if (erroSenha) setErroSenha(null);
              if (sucessoSenha) setSucessoSenha(null);
            }}
            required
          />
        </label>
        <label>
          Confirmar nova senha
          <input
            type="password"
            placeholder="Confirma a nova senha"
            value={confirmarNovaSenha}
            onChange={(e) => {
              setConfirmarNovaSenha(e.target.value);
              if (erroSenha) setErroSenha(null);
              if (sucessoSenha) setSucessoSenha(null);
            }}
            required
          />
        </label>
        {erroSenha && <p className="erro">{erroSenha}</p>}
        {sucessoSenha && <p className="sucesso">{sucessoSenha}</p>}
        <button className="btn" type="submit" disabled={salvandoSenha}>
          {salvandoSenha ? "A atualizar…" : "Alterar senha"}
        </button>
      </form>
    </div>
  );
}
