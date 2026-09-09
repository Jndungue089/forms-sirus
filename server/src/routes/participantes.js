import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { ah } from "../asyncHandler.js";

const router = Router();

function toApi(row) {
  return {
    id: row.id,
    nome: row.nome,
    idade: row.idade,
    tiktok: row.tiktok,
    youtube: row.youtube,
    facebook: row.facebook,
    status: row.status,
  };
}

async function proximoId() {
  const { rows } = await pool.query("SELECT id FROM participantes");
  const numeros = rows.map((r) => parseInt(r.id.replace("VRS", ""), 10)).filter((n) => !Number.isNaN(n));
  const proximo = (numeros.length ? Math.max(...numeros) : 0) + 1;
  return `VRS${String(proximo).padStart(3, "0")}`;
}

router.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM participantes ORDER BY id");
    res.json(rows.map(toApi));
  })
);

router.post(
  "/",
  ah(async (req, res) => {
    const { nome, idade, tiktok = "", youtube = "", facebook = "", senha } = req.body ?? {};
    if (!nome || !idade || !senha) {
      return res.status(400).json({ error: "Nome, idade e senha são obrigatórios." });
    }

    const config = await pool.query(
      "SELECT limite_participantes, inscricoes_fechadas_manualmente FROM configuracoes WHERE id = 1"
    );
    const countResult = await pool.query("SELECT COUNT(*)::int AS total FROM participantes");
    const { limite_participantes: limite, inscricoes_fechadas_manualmente: fechadas } = config.rows[0];
    const total = countResult.rows[0].total;
    if (fechadas || (limite !== null && total >= limite)) {
      return res.status(403).json({ error: "As inscrições estão encerradas." });
    }

    const id = await proximoId();
    const hash = bcrypt.hashSync(senha, 10);
    const { rows } = await pool.query(
      `INSERT INTO participantes (id, nome, idade, tiktok, youtube, facebook, status, senha_hash)
       VALUES ($1,$2,$3,$4,$5,$6,'Ativo',$7) RETURNING *`,
      [id, nome, idade, tiktok, youtube, facebook, hash]
    );
    res.status(201).json(toApi(rows[0]));
  })
);

router.patch(
  "/:id",
  ah(async (req, res) => {
    const { id } = req.params;
    const { nome, idade, tiktok, youtube, facebook, status, senha } = req.body ?? {};

    const existing = await pool.query("SELECT * FROM participantes WHERE id = $1", [id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: "Participante não encontrado." });
    const atual = existing.rows[0];

    const senhaHash = senha ? bcrypt.hashSync(senha, 10) : atual.senha_hash;
    const { rows } = await pool.query(
      `UPDATE participantes SET nome=$1, idade=$2, tiktok=$3, youtube=$4, facebook=$5, status=$6, senha_hash=$7
       WHERE id=$8 RETURNING *`,
      [
        nome ?? atual.nome,
        idade ?? atual.idade,
        tiktok ?? atual.tiktok,
        youtube ?? atual.youtube,
        facebook ?? atual.facebook,
        status ?? atual.status,
        senhaHash,
        id,
      ]
    );
    res.json(toApi(rows[0]));
  })
);

router.delete(
  "/:id",
  ah(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM participantes WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Participante não encontrado." });
    res.status(204).end();
  })
);

export default router;
