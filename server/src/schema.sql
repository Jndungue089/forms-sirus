CREATE TABLE IF NOT EXISTS participantes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL,
  tiktok TEXT NOT NULL DEFAULT '',
  youtube TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Ativo',
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registros (
  id SERIAL PRIMARY KEY,
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
  id INTEGER PRIMARY KEY DEFAULT 1,
  limite_participantes INTEGER,
  inscricoes_fechadas_manualmente BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT configuracoes_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS evento (
  id INTEGER PRIMARY KEY DEFAULT 1,
  nome TEXT NOT NULL,
  liga TEXT NOT NULL,
  ultima_atualizacao TEXT NOT NULL,
  CONSTRAINT evento_singleton CHECK (id = 1)
);
