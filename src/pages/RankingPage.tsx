import { useData } from "../context/DataContext";
import { eventoStats } from "../data";

const fmt = (n: number) => n.toLocaleString("pt-PT");

export default function RankingPage() {
  const { participantes, ranking } = useData();

  const totalViews = ranking.reduce((acc, r) => acc + r.total, 0);
  const totalConteudos = ranking.reduce((acc, r) => acc + r.conteudos, 0);

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-liga">{eventoStats.liga}</p>
        <h1>{eventoStats.nome}</h1>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{fmt(participantes.length)}</span>
            <span className="stat-label">Participantes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{fmt(totalConteudos)}</span>
            <span className="stat-label">Conteúdos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{fmt(totalViews)}</span>
            <span className="stat-label">Views</span>
          </div>
        </div>
        <p className="atualizacao">Última atualização: {eventoStats.ultimaAtualizacao}</p>
      </header>

      <main>
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Participante</th>
              <th>Views TikTok</th>
              <th>Views YouTube</th>
              <th>Total</th>
              <th>Conteúdos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r) => (
              <tr key={r.id} className={r.pos <= 3 ? `pos-${r.pos}` : undefined}>
                <td className="pos">{r.pos}º</td>
                <td className="nome">{r.nome}</td>
                <td>{fmt(r.viewsTiktok)}</td>
                <td>{fmt(r.viewsYoutube)}</td>
                <td className="total">{fmt(r.total)}</td>
                <td>{r.conteudos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
