import { Router } from "express";
import { pool } from "../db.js";
import { ah } from "../asyncHandler.js";

const router = Router();

function toApi(row) {
  return { nome: row.nome, liga: row.liga, ultimaAtualizacao: row.ultima_atualizacao };
}

router.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM evento WHERE id = 1");
    res.json(toApi(rows[0]));
  })
);

router.patch(
  "/",
  ah(async (req, res) => {
    const current = await pool.query("SELECT * FROM evento WHERE id = 1");
    const atual = current.rows[0];
    const { nome, liga, ultimaAtualizacao } = req.body ?? {};
    const { rows } = await pool.query("UPDATE evento SET nome=$1, liga=$2, ultima_atualizacao=$3 WHERE id=1 RETURNING *", [
      nome ?? atual.nome,
      liga ?? atual.liga,
      ultimaAtualizacao ?? atual.ultima_atualizacao,
    ]);
    res.json(toApi(rows[0]));
  })
);

export default router;
