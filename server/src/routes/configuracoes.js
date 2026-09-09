import { Router } from "express";
import { pool } from "../db.js";
import { ah } from "../asyncHandler.js";

const router = Router();

async function getStatus() {
  const configResult = await pool.query(
    "SELECT limite_participantes, inscricoes_fechadas_manualmente FROM configuracoes WHERE id = 1"
  );
  const countResult = await pool.query("SELECT COUNT(*)::int AS total FROM participantes");
  const { limite_participantes: limiteParticipantes, inscricoes_fechadas_manualmente: inscricoesFechadasManualmente } =
    configResult.rows[0];
  const total = countResult.rows[0].total;
  const limiteAtingido = limiteParticipantes !== null && total >= limiteParticipantes;
  return {
    limiteParticipantes,
    inscricoesFechadasManualmente,
    totalParticipantes: total,
    inscricoesAbertas: !inscricoesFechadasManualmente && !limiteAtingido,
  };
}

router.get(
  "/",
  ah(async (_req, res) => {
    res.json(await getStatus());
  })
);

router.patch(
  "/",
  ah(async (req, res) => {
    const { limiteParticipantes, inscricoesFechadasManualmente } = req.body ?? {};
    const current = await pool.query("SELECT * FROM configuracoes WHERE id = 1");
    const atual = current.rows[0];
    await pool.query("UPDATE configuracoes SET limite_participantes = $1, inscricoes_fechadas_manualmente = $2 WHERE id = 1", [
      limiteParticipantes !== undefined ? limiteParticipantes : atual.limite_participantes,
      inscricoesFechadasManualmente !== undefined ? inscricoesFechadasManualmente : atual.inscricoes_fechadas_manualmente,
    ]);
    res.json(await getStatus());
  })
);

export default router;
