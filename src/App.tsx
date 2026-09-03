import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RankingPage from "./pages/RankingPage";
import InscricaoPage from "./pages/InscricaoPage";
import ResultadosPage from "./pages/ResultadosPage";
import LoginPage from "./pages/LoginPage";
import AreaParticipantePage from "./pages/AreaParticipantePage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<RankingPage />} />
        <Route path="inscricao" element={<InscricaoPage />} />
        <Route path="resultados" element={<ResultadosPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="area"
          element={
            <RequireAuth>
              <AreaParticipantePage />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
