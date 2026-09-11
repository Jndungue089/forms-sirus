import { useState } from "react";
import { useData } from "../context/DataContext";

const fmt = (n: number) => n.toLocaleString("pt-PT");

type Tab = "ranking" | "participantes" | "registros";

interface PainelEventoProps {
  mostrarIds?: boolean;
  mostrarEstatisticas?: boolean;
  admin?: boolean;
}

export default function PainelEvento({ mostrarIds = true, mostrarEstatisticas = true, admin = true }: PainelEventoProps) {
  const { participantes, ranking, eventoStats, historico, ocultarTop3 } = useData();
  const [tab, setTab] = useState<Tab>("ranking");

  const totalViews = ranking.reduce((acc, r) => acc + r.total, 0);
  const totalCortes = ranking.reduce((acc, r) => acc + r.conteudos, 0);
  const suspenseAtivo = !admin && ocultarTop3;
  const posOculta = (pos: number) => suspenseAtivo && pos <= 3;

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-brand">
          <p className="hero-liga">{eventoStats.liga}</p>
          <h1>{eventoStats.nome}</h1>
        </div>
        {mostrarEstatisticas && (
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{fmt(participantes.length)}</span>
              <span className="stat-label">Participantes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{fmt(totalCortes)}</span>
              <span className="stat-label">Cortes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{fmt(totalViews)}</span>
              <span className="stat-label">Views</span>
            </div>
          </div>
        )}
        <p className="atualizacao">Última atualização: {eventoStats.ultimaAtualizacao}</p>
      </header>

      <nav className="tabs">
        <button className={`tab${tab === "ranking" ? " active" : ""}`} onClick={() => setTab("ranking")}>
          Ranking
        </button>
        <button className={`tab${tab === "participantes" ? " active" : ""}`} onClick={() => setTab("participantes")}>
          Participantes
        </button>
        <button className={`tab${tab === "registros" ? " active" : ""}`} onClick={() => setTab("registros")}>
          Registros
        </button>
      </nav>

      {suspenseAtivo && <p className="suspense-banner">🔒 O TOP 3 será revelado em breve. Fica atento!</p>}

      <main className="painel-evento">
        <div className="painel-content">
          {tab === "ranking" && (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Participante</th>
                  <th>Views TikTok</th>
                  <th>Views YouTube</th>
                  <th>Views Facebook</th>
                  <th>Total</th>
                  <th>Cortes</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => {
                  const oculto = posOculta(r.pos);
                  return (
                    <tr key={r.id} className={r.pos <= 3 ? `pos-${r.pos}` : undefined}>
                      <td className="pos" data-label="Pos.">
                        {r.pos}º
                      </td>
                      <td className={`nome${oculto ? " valor-oculto" : ""}`} data-label="Participante">
                        {oculto ? "???" : r.nome}
                      </td>
                      <td className={oculto ? "valor-oculto" : undefined} data-label="Views TikTok">
                        {oculto ? "•••••" : fmt(r.viewsTiktok)}
                      </td>
                      <td className={oculto ? "valor-oculto" : undefined} data-label="Views YouTube">
                        {oculto ? "•••••" : fmt(r.viewsYoutube)}
                      </td>
                      <td className={oculto ? "valor-oculto" : undefined} data-label="Views Facebook">
                        {oculto ? "•••••" : fmt(r.viewsFacebook)}
                      </td>
                      <td className={`total${oculto ? " valor-oculto" : ""}`} data-label="Total">
                        {oculto ? "•••••" : fmt(r.total)}
                      </td>
                      <td className={oculto ? "valor-oculto" : undefined} data-label="Cortes">
                        {oculto ? "••" : r.conteudos}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {tab === "participantes" && (
            <table className="participantes-table">
              <thead>
                <tr>
                  {mostrarIds && <th>ID</th>}
                  <th>Nome</th>
                  <th>Idade</th>
                  <th>TikTok</th>
                  <th>YouTube</th>
                  <th>Facebook</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participantes.map((p) => (
                  <tr key={p.id}>
                    {mostrarIds && <td data-label="ID">{p.id}</td>}
                    <td className="nome" data-label="Nome">
                      {p.nome}
                    </td>
                    <td data-label="Idade">{p.idade}</td>
                    <td data-label="TikTok">{p.tiktok}</td>
                    <td data-label="YouTube">{p.youtube}</td>
                    <td data-label="Facebook">{p.facebook}</td>
                    <td data-label="Status">
                      <span className="badge">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "registros" && (
            <div className="historico-grid">
              {participantes.map((p) => {
                const linha = ranking.find((r) => r.id === p.id);
                const h = historico[p.id];
                const oculto = linha ? posOculta(linha.pos) : false;
                return (
                  <div className="historico-card" key={p.id}>
                    <div className="historico-card-head">
                      <span className={`historico-nome${oculto ? " valor-oculto" : ""}`}>{oculto ? "???" : p.nome}</span>
                      {mostrarIds && !oculto && <span className="historico-id">{p.id}</span>}
                    </div>
                    <div className="historico-stats">
                      <div className="historico-stat">
                        <span className="historico-valor">{h?.vitorias ?? 0}</span>
                        <span className="historico-label">Vitórias</span>
                      </div>
                      <div className="historico-stat">
                        <span className={`historico-valor${oculto ? " valor-oculto" : ""}`}>
                          {oculto ? "??" : h?.melhorPosicao != null ? `${h.melhorPosicao}º` : linha ? `${linha.pos}º` : "—"}
                        </span>
                        <span className="historico-label">Melhor posição</span>
                      </div>
                      <div className="historico-stat">
                        <span className={`historico-valor${oculto ? " valor-oculto" : ""}`}>
                          {oculto ? "•••••" : fmt(linha?.total ?? 0)}
                        </span>
                        <span className="historico-label">Views</span>
                      </div>
                      <div className="historico-stat">
                        <span className={`historico-valor${oculto ? " valor-oculto" : ""}`}>
                          {oculto ? "••" : linha?.conteudos ?? 0}
                        </span>
                        <span className="historico-label">Cortes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <p className="tagline">Tu és o teu melhor Investimento</p>
    </div>
  );
}
