import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const fmt = (n: number) => n.toLocaleString("pt-PT");

export default function AreaParticipantePage() {
  const { participanteId } = useAuth();
  const { ranking, getParticipante } = useData();

  const participante = getParticipante(participanteId ?? "");
  const minhaLinha = ranking.find((r) => r.id === participanteId);
  const acima = minhaLinha ? ranking.find((r) => r.pos === minhaLinha.pos - 1) : undefined;

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-liga">Minha Área</p>
        <h1>{participante?.nome ?? participanteId}</h1>
      </header>

      <main className="area-participante">
        {minhaLinha ? (
          <>
            <div className="destaque-pos">
              <span className="destaque-numero">{minhaLinha.pos}º</span>
              <span className="destaque-label">posição atual</span>
            </div>
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{fmt(minhaLinha.viewsTiktok)}</span>
                <span className="stat-label">Views TikTok</span>
              </div>
              <div className="stat">
                <span className="stat-value">{fmt(minhaLinha.viewsYoutube)}</span>
                <span className="stat-label">Views YouTube</span>
              </div>
              <div className="stat">
                <span className="stat-value">{fmt(minhaLinha.total)}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{minhaLinha.conteudos}</span>
                <span className="stat-label">Conteúdos</span>
              </div>
            </div>
            {acima && (
              <p className="hint centro">
                Faltam <strong>{fmt(acima.total - minhaLinha.total)}</strong> views para ultrapassar{" "}
                <strong>{acima.nome}</strong> ({acima.pos}º lugar).
              </p>
            )}
          </>
        ) : (
          <p className="hint centro">Ainda não tens resultados registados. Envia o teu primeiro resultado em "Enviar Resultados".</p>
        )}
      </main>
    </div>
  );
}
