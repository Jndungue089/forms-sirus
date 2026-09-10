// Base de dados local (SQLite via sql.js, a correr inteiramente no browser).
// Feita para servir de "backend" apenas para efeitos de apresentação/demo — não há
// partilha de dados entre visitantes, cada browser tem a sua própria cópia,
// persistida em localStorage. O backend real (Express + Postgres) continua em /server
// para quando for preciso um ambiente multi-utilizador a sério.

import initSqlJs, { type Database } from "sql.js";
import bcrypt from "bcryptjs";
import type {
  ConfiguracoesStatus,
  EventoStats,
  HistoricoParticipante,
  NovoParticipante,
  NovoRegistro,
  Participante,
  Registro,
} from "../data";

const STORAGE_KEY = "liga-de-cortes-db-v1";

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS participantes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    idade INTEGER NOT NULL,
    tiktok TEXT NOT NULL DEFAULT '',
    youtube TEXT NOT NULL DEFAULT '',
    facebook TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Ativo',
    senha_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_id TEXT NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    views_tiktok INTEGER NOT NULL DEFAULT 0,
    views_youtube INTEGER NOT NULL DEFAULT 0,
    views_facebook INTEGER NOT NULL DEFAULT 0,
    cortes INTEGER NOT NULL DEFAULT 0,
    links TEXT
  );

  CREATE TABLE IF NOT EXISTS historico (
    participante_id TEXT PRIMARY KEY REFERENCES participantes(id) ON DELETE CASCADE,
    vitorias INTEGER NOT NULL DEFAULT 0,
    melhor_posicao INTEGER
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    senha_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS configuracoes (
    id INTEGER PRIMARY KEY,
    limite_participantes INTEGER,
    inscricoes_fechadas_manualmente INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS evento (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    liga TEXT NOT NULL,
    ultima_atualizacao TEXT NOT NULL
  );
`;

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

const historicoSeed: Record<string, HistoricoParticipante> = {
  VRS001: { vitorias: 2, melhorPosicao: 1 },
  VRS002: { vitorias: 1, melhorPosicao: 1 },
  VRS003: { vitorias: 1, melhorPosicao: 2 },
  VRS004: { vitorias: 0, melhorPosicao: 3 },
  VRS005: { vitorias: 0, melhorPosicao: 4 },
  VRS006: { vitorias: 0, melhorPosicao: 5 },
  VRS007: { vitorias: 0, melhorPosicao: 6 },
  VRS008: { vitorias: 0, melhorPosicao: 7 },
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function persist(db: Database) {
  try {
    localStorage.setItem(STORAGE_KEY, bytesToBase64(db.export()));
  } catch {
    // localStorage indisponível (modo privado, quota, etc.) — a demo continua a funcionar em memória.
  }
}

function seed(db: Database) {
  for (const p of participantesSeed) {
    const hash = bcrypt.hashSync(p.senha, 8);
    run(db, `INSERT INTO participantes (id, nome, idade, tiktok, youtube, facebook, status, senha_hash) VALUES (?,?,?,?,?,?,'Ativo',?)`, [
      p.id,
      p.nome,
      p.idade,
      p.tiktok,
      p.youtube,
      p.facebook,
      hash,
    ]);
  }

  for (const r of registrosSeed) {
    run(
      db,
      `INSERT INTO registros (participante_id, data, views_tiktok, views_youtube, views_facebook, cortes) VALUES (?,?,?,?,?,?)`,
      [r.id, r.data, r.viewsTiktok, r.viewsYoutube, r.viewsFacebook, r.cortes]
    );
  }

  for (const [id, h] of Object.entries(historicoSeed)) {
    run(db, `INSERT INTO historico (participante_id, vitorias, melhor_posicao) VALUES (?,?,?)`, [id, h.vitorias, h.melhorPosicao]);
  }

  const adminHash = bcrypt.hashSync("admin123", 8);
  run(db, `INSERT INTO admins (id, senha_hash) VALUES ('ADMIN', ?)`, [adminHash]);
  run(db, `INSERT INTO configuracoes (id, limite_participantes, inscricoes_fechadas_manualmente) VALUES (1, NULL, 0)`);
  run(db, `INSERT INTO evento (id, nome, liga, ultima_atualizacao) VALUES (1, 'EVENTO X', 'LIGA DE CORTES', '13/08 — 18:00')`);
}

type SqlParam = string | number | null;

function run(db: Database, sql: string, params: SqlParam[] = []) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    stmt.step();
  } finally {
    stmt.free();
  }
}

function queryAll<T>(db: Database, sql: string, params: SqlParam[] = []): T[] {
  const stmt = db.prepare(sql);
  const rows: T[] = [];
  try {
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
  } finally {
    stmt.free();
  }
  return rows;
}

function queryOne<T>(db: Database, sql: string, params: SqlParam[] = []): T | undefined {
  return queryAll<T>(db, sql, params)[0];
}

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

async function createDb(): Promise<Database> {
  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });

  const saved = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  })();

  if (saved) {
    try {
      const db = new SQL.Database(base64ToBytes(saved));
      run(db, "PRAGMA foreign_keys = ON;");
      return db;
    } catch {
      // dump corrompido/incompatível — recomeça do zero
    }
  }

  const db = new SQL.Database();
  db.run(SCHEMA);
  seed(db);
  persist(db);
  return db;
}

async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (!initPromise) initPromise = createDb();
  dbInstance = await initPromise;
  return dbInstance;
}

function toParticipanteApi(row: any): Participante {
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

function toRegistroApi(row: any): Registro {
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

function proximoId(db: Database): string {
  const rows = queryAll<{ id: string }>(db, "SELECT id FROM participantes");
  const numeros = rows.map((r) => parseInt(r.id.replace("VRS", ""), 10)).filter((n) => !Number.isNaN(n));
  const proximo = (numeros.length ? Math.max(...numeros) : 0) + 1;
  return `VRS${String(proximo).padStart(3, "0")}`;
}

function getConfigStatus(db: Database): ConfiguracoesStatus {
  const cfg = queryOne<{ limite_participantes: number | null; inscricoes_fechadas_manualmente: number }>(
    db,
    "SELECT limite_participantes, inscricoes_fechadas_manualmente FROM configuracoes WHERE id = 1"
  )!;
  const total = queryOne<{ total: number }>(db, "SELECT COUNT(*) AS total FROM participantes")!.total;
  const limiteAtingido = cfg.limite_participantes !== null && total >= cfg.limite_participantes;
  return {
    limiteParticipantes: cfg.limite_participantes,
    inscricoesFechadasManualmente: !!cfg.inscricoes_fechadas_manualmente,
    totalParticipantes: total,
    inscricoesAbertas: !cfg.inscricoes_fechadas_manualmente && !limiteAtingido,
  };
}

export const localApi = {
  async login(id: string, senha: string) {
    const db = await getDb();
    const cleanId = id.trim();

    const admin = queryOne<{ id: string; senha_hash: string }>(db, "SELECT id, senha_hash FROM admins WHERE UPPER(id) = UPPER(?)", [
      cleanId,
    ]);
    if (admin) {
      if (bcrypt.compareSync(senha, admin.senha_hash)) {
        return { ok: true, isAdmin: true, participanteId: admin.id };
      }
      throw new Error("ID ou senha incorretos.");
    }

    const participante = queryOne<{ id: string; senha_hash: string }>(
      db,
      "SELECT id, senha_hash FROM participantes WHERE UPPER(id) = UPPER(?)",
      [cleanId]
    );
    if (!participante || !bcrypt.compareSync(senha, participante.senha_hash)) {
      throw new Error("ID ou senha incorretos.");
    }
    return { ok: true, isAdmin: false, participanteId: participante.id };
  },

  async alterarSenhaAdmin(adminId: string, senhaAtual: string, novaSenha: string) {
    const db = await getDb();
    const cleanId = (adminId || "ADMIN").trim();

    if (!senhaAtual || !novaSenha) {
      throw new Error("Preenche todos os campos de senha.");
    }
    if (novaSenha.length < 3) {
      throw new Error("A nova senha deve ter pelo menos 3 caracteres.");
    }

    const admin = queryOne<{ id: string; senha_hash: string }>(
      db,
      "SELECT id, senha_hash FROM admins WHERE UPPER(id) = UPPER(?)",
      [cleanId]
    );

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }

    if (!bcrypt.compareSync(senhaAtual, admin.senha_hash)) {
      throw new Error("A senha atual está incorreta.");
    }

    const novaHash = bcrypt.hashSync(novaSenha, 8);
    run(db, "UPDATE admins SET senha_hash = ? WHERE UPPER(id) = UPPER(?)", [novaHash, cleanId]);
    persist(db);
    return { ok: true };
  },

  async getParticipantes() {
    const db = await getDb();
    return queryAll<any>(db, "SELECT * FROM participantes ORDER BY id").map(toParticipanteApi);
  },

  async addParticipante(data: NovoParticipante) {
    const db = await getDb();
    const status = getConfigStatus(db);
    if (!status.inscricoesAbertas) throw new Error("As inscrições estão encerradas.");

    const id = proximoId(db);
    const hash = bcrypt.hashSync(data.senha, 8);
    run(
      db,
      `INSERT INTO participantes (id, nome, idade, tiktok, youtube, facebook, status, senha_hash) VALUES (?,?,?,?,?,?,'Ativo',?)`,
      [id, data.nome, data.idade, data.tiktok, data.youtube, data.facebook, hash]
    );
    persist(db);
    return toParticipanteApi(queryOne(db, "SELECT * FROM participantes WHERE id = ?", [id]));
  },

  async updateParticipante(id: string, data: Partial<NovoParticipante> & { status?: Participante["status"] }) {
    const db = await getDb();
    const atual = queryOne<any>(db, "SELECT * FROM participantes WHERE id = ?", [id]);
    if (!atual) throw new Error("Participante não encontrado.");

    const senhaHash = data.senha ? bcrypt.hashSync(data.senha, 8) : atual.senha_hash;
    run(
      db,
      `UPDATE participantes SET nome=?, idade=?, tiktok=?, youtube=?, facebook=?, status=?, senha_hash=? WHERE id=?`,
      [
        data.nome ?? atual.nome,
        data.idade ?? atual.idade,
        data.tiktok ?? atual.tiktok,
        data.youtube ?? atual.youtube,
        data.facebook ?? atual.facebook,
        data.status ?? atual.status,
        senhaHash,
        id,
      ]
    );
    persist(db);
    return toParticipanteApi(queryOne(db, "SELECT * FROM participantes WHERE id = ?", [id]));
  },

  async deleteParticipante(id: string) {
    const db = await getDb();
    const atual = queryOne(db, "SELECT id FROM participantes WHERE id = ?", [id]);
    if (!atual) throw new Error("Participante não encontrado.");
    run(db, "DELETE FROM participantes WHERE id = ?", [id]);
    persist(db);
  },

  async getRegistros() {
    const db = await getDb();
    return queryAll<any>(db, "SELECT * FROM registros ORDER BY id").map(toRegistroApi);
  },

  async addRegistro(data: NovoRegistro) {
    const db = await getDb();
    const participante = queryOne(db, "SELECT id FROM participantes WHERE UPPER(id) = UPPER(?)", [data.participanteId]);
    if (!participante) throw new Error("Participante não encontrado.");

    run(
      db,
      `INSERT INTO registros (participante_id, data, views_tiktok, views_youtube, views_facebook, cortes, links) VALUES (?,?,?,?,?,?,?)`,
      [data.participanteId, data.data, data.viewsTiktok, data.viewsYoutube, data.viewsFacebook, data.cortes, data.links || null]
    );
    persist(db);
    const row = queryOne<any>(db, "SELECT * FROM registros WHERE id = last_insert_rowid()");
    return toRegistroApi(row);
  },

  async updateRegistro(id: number, data: Partial<NovoRegistro>) {
    const db = await getDb();
    const atual = queryOne<any>(db, "SELECT * FROM registros WHERE id = ?", [id]);
    if (!atual) throw new Error("Registo não encontrado.");

    run(db, `UPDATE registros SET data=?, views_tiktok=?, views_youtube=?, views_facebook=?, cortes=?, links=? WHERE id=?`, [
      data.data ?? atual.data,
      data.viewsTiktok ?? atual.views_tiktok,
      data.viewsYoutube ?? atual.views_youtube,
      data.viewsFacebook ?? atual.views_facebook,
      data.cortes ?? atual.cortes,
      data.links ?? atual.links,
      id,
    ]);
    persist(db);
    return toRegistroApi(queryOne(db, "SELECT * FROM registros WHERE id = ?", [id]));
  },

  async deleteRegistro(id: number) {
    const db = await getDb();
    const atual = queryOne(db, "SELECT id FROM registros WHERE id = ?", [id]);
    if (!atual) throw new Error("Registo não encontrado.");
    run(db, "DELETE FROM registros WHERE id = ?", [id]);
    persist(db);
  },

  async getHistorico() {
    const db = await getDb();
    const rows = queryAll<{ participante_id: string; vitorias: number; melhor_posicao: number | null }>(db, "SELECT * FROM historico");
    const map: Record<string, HistoricoParticipante> = {};
    for (const r of rows) map[r.participante_id] = { vitorias: r.vitorias, melhorPosicao: r.melhor_posicao };
    return map;
  },

  async setHistorico(participanteId: string, data: HistoricoParticipante) {
    const db = await getDb();
    const participante = queryOne(db, "SELECT id FROM participantes WHERE id = ?", [participanteId]);
    if (!participante) throw new Error("Participante não encontrado.");
    run(
      db,
      `INSERT INTO historico (participante_id, vitorias, melhor_posicao) VALUES (?,?,?)
       ON CONFLICT(participante_id) DO UPDATE SET vitorias = excluded.vitorias, melhor_posicao = excluded.melhor_posicao`,
      [participanteId, data.vitorias, data.melhorPosicao]
    );
    persist(db);
    return { participanteId, ...data };
  },

  async getConfiguracoes() {
    const db = await getDb();
    return getConfigStatus(db);
  },

  async updateConfiguracoes(data: Partial<Pick<ConfiguracoesStatus, "limiteParticipantes" | "inscricoesFechadasManualmente">>) {
    const db = await getDb();
    const atual = queryOne<{ limite_participantes: number | null; inscricoes_fechadas_manualmente: number }>(
      db,
      "SELECT limite_participantes, inscricoes_fechadas_manualmente FROM configuracoes WHERE id = 1"
    )!;
    run(db, "UPDATE configuracoes SET limite_participantes = ?, inscricoes_fechadas_manualmente = ? WHERE id = 1", [
      data.limiteParticipantes !== undefined ? data.limiteParticipantes : atual.limite_participantes,
      data.inscricoesFechadasManualmente !== undefined ? (data.inscricoesFechadasManualmente ? 1 : 0) : atual.inscricoes_fechadas_manualmente,
    ]);
    persist(db);
    return getConfigStatus(db);
  },

  async getEvento() {
    const db = await getDb();
    const row = queryOne<any>(db, "SELECT * FROM evento WHERE id = 1")!;
    return { nome: row.nome, liga: row.liga, ultimaAtualizacao: row.ultima_atualizacao } as EventoStats;
  },

  async updateEvento(data: Partial<EventoStats>) {
    const db = await getDb();
    const atual = queryOne<any>(db, "SELECT * FROM evento WHERE id = 1")!;
    run(db, "UPDATE evento SET nome=?, liga=?, ultima_atualizacao=? WHERE id=1", [
      data.nome ?? atual.nome,
      data.liga ?? atual.liga,
      data.ultimaAtualizacao ?? atual.ultima_atualizacao,
    ]);
    persist(db);
    const row = queryOne<any>(db, "SELECT * FROM evento WHERE id = 1")!;
    return { nome: row.nome, liga: row.liga, ultimaAtualizacao: row.ultima_atualizacao } as EventoStats;
  },
};
