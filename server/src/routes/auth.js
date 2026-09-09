import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { ah } from "../asyncHandler.js";

const router = Router();

router.post(
  "/login",
  ah(async (req, res) => {
    const { id, senha } = req.body ?? {};
    if (!id || !senha) return res.status(400).json({ ok: false, error: "ID e senha são obrigatórios." });
    const cleanId = String(id).trim();

    const adminResult = await pool.query("SELECT id, senha_hash FROM admins WHERE UPPER(id) = UPPER($1)", [cleanId]);
    if (adminResult.rowCount > 0) {
      const admin = adminResult.rows[0];
      if (bcrypt.compareSync(senha, admin.senha_hash)) {
        return res.json({ ok: true, isAdmin: true, participanteId: admin.id });
      }
      return res.status(401).json({ ok: false, error: "ID ou senha incorretos." });
    }

    const partResult = await pool.query("SELECT id, senha_hash FROM participantes WHERE UPPER(id) = UPPER($1)", [cleanId]);
    if (partResult.rowCount === 0 || !bcrypt.compareSync(senha, partResult.rows[0].senha_hash)) {
      return res.status(401).json({ ok: false, error: "ID ou senha incorretos." });
    }
    res.json({ ok: true, isAdmin: false, participanteId: partResult.rows[0].id });
  })
);

export default router;
