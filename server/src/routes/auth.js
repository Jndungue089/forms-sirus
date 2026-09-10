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

router.post(
  "/alterar-senha-admin",
  ah(async (req, res) => {
    const { id, senhaAtual, novaSenha } = req.body ?? {};
    if (!id || !senhaAtual || !novaSenha) {
      return res.status(400).json({ ok: false, error: "Preenche todos os campos de senha." });
    }
    if (novaSenha.length < 3) {
      return res.status(400).json({ ok: false, error: "A nova senha deve ter pelo menos 3 caracteres." });
    }
    const cleanId = String(id).trim();
    const adminResult = await pool.query("SELECT id, senha_hash FROM admins WHERE UPPER(id) = UPPER($1)", [cleanId]);
    if (adminResult.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Administrador não encontrado." });
    }
    const admin = adminResult.rows[0];
    if (!bcrypt.compareSync(senhaAtual, admin.senha_hash)) {
      return res.status(401).json({ ok: false, error: "A senha atual está incorreta." });
    }
    const newHash = bcrypt.hashSync(novaSenha, 10);
    await pool.query("UPDATE admins SET senha_hash = $1 WHERE UPPER(id) = UPPER($2)", [newHash, cleanId]);
    res.json({ ok: true });
  })
);

export default router;
