import { Router } from "express";
import { pool } from "../db.js";
import { ah } from "../asyncHandler.js";

const router = Router();

router.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM historico");
    const map = {};
    for (const r of rows) {
      map[r.participante_id] = { vitorias: r.vitorias, melhorPosicao: r.melhor_posicao };
    }
    res.json(map);
  })
);

router.put(
  "/:participanteId",
  ah(async (req, res) => {
    const { participanteId } = req.params;
    const { vitorias = 0, melhorPosicao = null } = req.body ?? {};
    const participante = await pool.query("SELECT id FROM participantes WHERE id = $1", [participanteId]);
    if (participante.rowCount === 0) return res.status(404).json({ error: "Participante não encontrado." });

    await pool.query(
      `INSERT INTO historico (participante_id, vitorias, melhor_posicao) VALUES ($1,$2,$3)
       ON CONFLICT (participante_id) DO UPDATE SET vitorias = EXCLUDED.vitorias, melhor_posicao = EXCLUDED.melhor_posicao`,
      [participanteId, vitorias, melhorPosicao]
    );
    res.json({ participanteId, vitorias, melhorPosicao });
  })
);

export default router;
