// Dados mock — no MVP real estes viriam do Google Sheets (abas PARTICIPANTES e REGISTROS)

export interface Participante {
  id: string;
  nome: string;
  idade: number;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  status: "Ativo" | "Inativo";
}

export interface Registro {
  data: string;
  id: string;
  viewsTiktok: number;
  viewsYoutube: number;
  cortes: number;
  links?: string;
}

export const participantes: Participante[] = [
  { id: "VRS001", nome: "João", idade: 19, tiktok: "@joao", youtube: "@joao", whatsapp: "9xx xxxxxx", status: "Ativo" },
  { id: "VRS002", nome: "Manuel", idade: 21, tiktok: "@manuel", youtube: "@manuel", whatsapp: "9xx xxx xxx", status: "Ativo" },
  { id: "VRS003", nome: "Pedro", idade: 23, tiktok: "@pedro", youtube: "@pedro", whatsapp: "9xx xxx xxx", status: "Ativo" },
  { id: "VRS004", nome: "Ana", idade: 20, tiktok: "@ana", youtube: "@ana", whatsapp: "9xx xxx xxx", status: "Ativo" },
  { id: "VRS005", nome: "Carla", idade: 24, tiktok: "@carla", youtube: "@carla", whatsapp: "9xx xxx xxx", status: "Ativo" },
  { id: "VRS006", nome: "Bruno", idade: 22, tiktok: "@bruno", youtube: "@bruno", whatsapp: "9xx xxx xxx", status: "Ativo" },
  { id: "VRS007", nome: "Sofia", idade: 18, tiktok: "@sofia", youtube: "@sofia", whatsapp: "9xx xxx xxx", status: "Ativo" },
  { id: "VRS008", nome: "Rui", idade: 25, tiktok: "@rui", youtube: "@rui", whatsapp: "9xx xxx xxx", status: "Ativo" },
];

export const registros: Registro[] = [
  { data: "01/09", id: "VRS001", viewsTiktok: 150000, viewsYoutube: 50000, cortes: 15 },
  { data: "02/09", id: "VRS001", viewsTiktok: 100000, viewsYoutube: 40000, cortes: 12 },
  { data: "01/09", id: "VRS002", viewsTiktok: 130000, viewsYoutube: 60000, cortes: 18 },
  { data: "02/09", id: "VRS002", viewsTiktok: 90000, viewsYoutube: 40000, cortes: 13 },
  { data: "01/09", id: "VRS003", viewsTiktok: 100000, viewsYoutube: 70000, cortes: 10 },
  { data: "02/09", id: "VRS003", viewsTiktok: 80000, viewsYoutube: 40000, cortes: 12 },
  { data: "01/09", id: "VRS004", viewsTiktok: 60000, viewsYoutube: 30000, cortes: 9 },
  { data: "02/09", id: "VRS004", viewsTiktok: 50000, viewsYoutube: 20000, cortes: 8 },
  { data: "01/09", id: "VRS005", viewsTiktok: 55000, viewsYoutube: 25000, cortes: 7 },
  { data: "02/09", id: "VRS005", viewsTiktok: 40000, viewsYoutube: 15000, cortes: 6 },
  { data: "01/09", id: "VRS006", viewsTiktok: 30000, viewsYoutube: 20000, cortes: 5 },
  { data: "02/09", id: "VRS006", viewsTiktok: 25000, viewsYoutube: 10000, cortes: 4 },
  { data: "01/09", id: "VRS007", viewsTiktok: 20000, viewsYoutube: 10000, cortes: 3 },
  { data: "01/09", id: "VRS008", viewsTiktok: 15000, viewsYoutube: 5000, cortes: 2 },
];

export interface RankingRow {
  pos: number;
  id: string;
  nome: string;
  viewsTiktok: number;
  viewsYoutube: number;
  total: number;
  conteudos: number;
}

export const eventoStats = {
  nome: "EVENTO X",
  liga: "LIGA DE CORTES",
  ultimaAtualizacao: "13/08 — 18:00",
};
