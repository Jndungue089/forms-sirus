import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import participantesRoutes from "./routes/participantes.js";
import registrosRoutes from "./routes/registros.js";
import historicoRoutes from "./routes/historico.js";
import configuracoesRoutes from "./routes/configuracoes.js";
import eventoRoutes from "./routes/evento.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/participantes", participantesRoutes);
app.use("/api/registros", registrosRoutes);
app.use("/api/historico", historicoRoutes);
app.use("/api/configuracoes", configuracoesRoutes);
app.use("/api/evento", eventoRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

export default app;
