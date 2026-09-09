import { useData } from "../../context/DataContext";
import PainelEvento from "../../components/PainelEvento";

export default function AdminDashboardPage() {
  const { participantes, ranking, inscricoesAbertas, limiteParticipantes } = useData();
  const totalViews = ranking.reduce((acc, r) => acc + r.total, 0);
  const totalCortes = ranking.reduce((acc, r) => acc + r.conteudos, 0);

  return (
    <>
      <div className="admin-kpis">
        <div className="admin-kpi">
          <span className="stat-value">{participantes.length}</span>
          <span className="stat-label">Participantes</span>
        </div>
        <div className="admin-kpi">
          <span className="stat-value">{totalCortes}</span>
          <span className="stat-label">Cortes publicados</span>
        </div>
        <div className="admin-kpi">
          <span className="stat-value">{totalViews.toLocaleString("pt-PT")}</span>
          <span className="stat-label">Views totais</span>
        </div>
        <div className="admin-kpi">
          <span className={`badge${inscricoesAbertas ? "" : " badge-fechado"}`}>
            {inscricoesAbertas ? "Inscrições abertas" : "Inscrições fechadas"}
          </span>
          <span className="stat-label">{limiteParticipantes ? `Limite: ${limiteParticipantes}` : "Sem limite"}</span>
        </div>
      </div>
      <PainelEvento />
    </>
  );
}
