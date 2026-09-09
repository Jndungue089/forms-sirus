import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/forms_sirus";
const dbName = new URL(databaseUrl).pathname.replace(/^\//, "");
const adminUrl = databaseUrl.replace(`/${dbName}`, "/postgres");

const participantesSeed = [
  { id: "VRS001", nome: "João", idade: 19, tiktok: "@joao", youtube: "@joao", facebook: "@joao", senha: "123" },
  { id: "VRS002", nome: "Manuel", idade: 21, tiktok: "@manuel", youtube: "@manuel", facebook: "@manuel", senha: "123" },
  { id: "VRS003", nome: "Pedro", idade: 23, tiktok: "@pedro", youtube: "@pedro", facebook: "@pedro", senha: "123" },
  { id: "VRS004", nome: "Ana", idade: 20, tiktok: "@ana", youtube: "@ana", facebook: "@ana", senha: "123" },
  { id: "VRS005", nome: "Carla", idade: 24, tiktok: "@carla", youtube: "@carla", facebook: "@carla", senha: "123" },
  { id: "VRS006", nome: "Bruno", idade: 22, tiktok: "@bruno", youtube: "@bruno", facebook: "@bruno", senha: "123" },
  { id: "VRS007", nome: "Sofia", idade: 18, tiktok: "@sofia", youtube: "@sofia", facebook: "@sofia", senha: "123" },
  { id: "VRS008", nome: "Rui", idade: 25, tiktok: "@rui", youtube: "@rui", facebook: "@rui", senha: "123" },
];

const registrosSeed = [
  { id: "VRS001", data: "01/09", viewsTiktok: 150000, viewsYoutube: 50000, viewsFacebook: 30000, cortes: 15 },
  { id: "VRS001", data: "02/09", viewsTiktok: 100000, viewsYoutube: 40000, viewsFacebook: 25000, cortes: 12 },
  { id: "VRS002", data: "01/09", viewsTiktok: 130000, viewsYoutube: 60000, viewsFacebook: 35000, cortes: 18 },
  { id: "VRS002", data: "02/09", viewsTiktok: 90000, viewsYoutube: 40000, viewsFacebook: 20000, cortes: 13 },
  { id: "VRS003", data: "01/09", viewsTiktok: 100000, viewsYoutube: 70000, viewsFacebook: 25000, cortes: 10 },
  { id: "VRS003", data: "02/09", viewsTiktok: 80000, viewsYoutube: 40000, viewsFacebook: 20000, cortes: 12 },
  { id: "VRS004", data: "01/09", viewsTiktok: 60000, viewsYoutube: 30000, viewsFacebook: 15000, cortes: 9 },
  { id: "VRS004", data: "02/09", viewsTiktok: 50000, viewsYoutube: 20000, viewsFacebook: 10000, cortes: 8 },
  { id: "VRS005", data: "01/09", viewsTiktok: 55000, viewsYoutube: 25000, viewsFacebook: 12000, cortes: 7 },
  { id: "VRS005", data: "02/09", viewsTiktok: 40000, viewsYoutube: 15000, viewsFacebook: 8000, cortes: 6 },
  { id: "VRS006", data: "01/09", viewsTiktok: 30000, viewsYoutube: 20000, viewsFacebook: 10000, cortes: 5 },
  { id: "VRS006", data: "02/09", viewsTiktok: 25000, viewsYoutube: 10000, viewsFacebook: 7000, cortes: 4 },
  { id: "VRS007", data: "01/09", viewsTiktok: 20000, viewsYoutube: 10000, viewsFacebook: 5000, cortes: 3 },
  { id: "VRS008", data: "01/09", viewsTiktok: 15000, viewsYoutube: 5000, viewsFacebook: 3000, cortes: 2 },
];

const historicoSeed = {
  VRS001: { vitorias: 2, melhorPosicao: 1 },
  VRS002: { vitorias: 1, melhorPosicao: 1 },
  VRS003: { vitorias: 1, melhorPosicao: 2 },
  VRS004: { vitorias: 0, melhorPosicao: 3 },
  VRS005: { vitorias: 0, melhorPosicao: 4 },
  VRS006: { vitorias: 0, melhorPosicao: 5 },
  VRS007: { vitorias: 0, melhorPosicao: 6 },
  VRS008: { vitorias: 0, melhorPosicao: 7 },
};

async function ensureDatabase() {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Base de dados "${dbName}" criada.`);
  }
  await client.end();
}

async function runSchemaAndSeed() {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);

  for (const p of participantesSeed) {
    const hash = bcrypt.hashSync(p.senha, 10);
    await pool.query(
      `INSERT INTO participantes (id, nome, idade, tiktok, youtube, facebook, status, senha_hash)
       VALUES ($1,$2,$3,$4,$5,$6,'Ativo',$7)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.nome, p.idade, p.tiktok, p.youtube, p.facebook, hash]
    );
  }

  for (const r of registrosSeed) {
    await pool.query(
      `INSERT INTO registros (participante_id, data, views_tiktok, views_youtube, views_facebook, cortes)
       SELECT $1,$2,$3,$4,$5,$6
       WHERE NOT EXISTS (
         SELECT 1 FROM registros WHERE participante_id = $1 AND data = $2 AND views_tiktok = $3
       )`,
      [r.id, r.data, r.viewsTiktok, r.viewsYoutube, r.viewsFacebook, r.cortes]
    );
  }

  for (const [id, h] of Object.entries(historicoSeed)) {
    await pool.query(
      `INSERT INTO historico (participante_id, vitorias, melhor_posicao) VALUES ($1,$2,$3)
       ON CONFLICT (participante_id) DO NOTHING`,
      [id, h.vitorias, h.melhorPosicao]
    );
  }

  const adminHash = bcrypt.hashSync("admin123", 10);
  await pool.query(`INSERT INTO admins (id, senha_hash) VALUES ('ADMIN', $1) ON CONFLICT (id) DO NOTHING`, [adminHash]);

  await pool.query(
    `INSERT INTO configuracoes (id, limite_participantes, inscricoes_fechadas_manualmente)
     VALUES (1, NULL, false) ON CONFLICT (id) DO NOTHING`
  );

  await pool.query(
    `INSERT INTO evento (id, nome, liga, ultima_atualizacao)
     VALUES (1, 'EVENTO X', 'LIGA DE CORTES', '13/08 — 18:00') ON CONFLICT (id) DO NOTHING`
  );

  await pool.end();
}

await ensureDatabase();
await runSchemaAndSeed();
console.log("Base de dados pronta.");
