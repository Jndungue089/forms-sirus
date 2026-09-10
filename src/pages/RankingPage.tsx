import PainelEvento from "../components/PainelEvento";

export default function RankingPage() {
  return (
    <div className="ranking-screen">
      <div className="ranking-screen-bg" aria-hidden="true" />
      <div className="ranking-screen-content">
        <PainelEvento mostrarIds={false} />
      </div>
    </div>
  );
}

