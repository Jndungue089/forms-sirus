import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RankingPage from "./pages/RankingPage";
import InscricaoPage from "./pages/InscricaoPage";
import ResultadosPage from "./pages/ResultadosPage";
import LoginPage from "./pages/LoginPage";
import AreaParticipantePage from "./pages/AreaParticipantePage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminParticipantesPage from "./pages/admin/AdminParticipantesPage";
import AdminRegistrosPage from "./pages/admin/AdminRegistrosPage";
import AdminConfiguracoesPage from "./pages/admin/AdminConfiguracoesPage";
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
        <Route
          path="admin"
          element={
            <RequireAuth adminOnly>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="participantes" element={<AdminParticipantesPage />} />
          <Route path="registos" element={<AdminRegistrosPage />} />
          <Route path="configuracoes" element={<AdminConfiguracoesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
