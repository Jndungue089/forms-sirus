import { Router } from "express";
import { pool } from "../db.js";
import { ah } from "../asyncHandler.js";

const router = Router();

function toApi(row) {
  return {
    id: row.id,
    participanteId: row.participante_id,
    data: row.data,
    viewsTiktok: row.views_tiktok,
    viewsYoutube: row.views_youtube,
    viewsFacebook: row.views_facebook,
    cortes: row.cortes,
    links: row.links ?? undefined,
  };
}

router.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM registros ORDER BY id");
    res.json(rows.map(toApi));
  })
);

router.post(
  "/",
  ah(async (req, res) => {
    const { participanteId, data, viewsTiktok = 0, viewsYoutube = 0, viewsFacebook = 0, cortes = 0, links } = req.body ?? {};
    if (!participanteId || !data) return res.status(400).json({ error: "participanteId e data são obrigatórios." });

    const participante = await pool.query("SELECT id FROM participantes WHERE UPPER(id) = UPPER($1)", [participanteId]);
    if (participante.rowCount === 0) return res.status(404).json({ error: "Participante não encontrado." });

    const { rows } = await pool.query(
      `INSERT INTO registros (participante_id, data, views_tiktok, views_youtube, views_facebook, cortes, links)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [participante.rows[0].id, data, viewsTiktok, viewsYoutube, viewsFacebook, cortes, links || null]
    );
    res.status(201).json(toApi(rows[0]));
  })
);

router.patch(
  "/:id",
  ah(async (req, res) => {
    const { id } = req.params;
    const existing = await pool.query("SELECT * FROM registros WHERE id = $1", [id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: "Registo não encontrado." });
    const atual = existing.rows[0];
    const { data, viewsTiktok, viewsYoutube, viewsFacebook, cortes, links } = req.body ?? {};

    const { rows } = await pool.query(
      `UPDATE registros SET data=$1, views_tiktok=$2, views_youtube=$3, views_facebook=$4, cortes=$5, links=$6
       WHERE id=$7 RETURNING *`,
      [
        data ?? atual.data,
        viewsTiktok ?? atual.views_tiktok,
        viewsYoutube ?? atual.views_youtube,
        viewsFacebook ?? atual.views_facebook,
        cortes ?? atual.cortes,
        links ?? atual.links,
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
    const result = await pool.query("DELETE FROM registros WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Registo não encontrado." });
    res.status(204).end();
  })
);

export default router;
