// Tipos partilhados com a API — os dados reais vivem no Postgres, servidos por /server.

export interface Participante {
  id: string;
  nome: string;
  idade: number;
  tiktok: string;
  youtube: string;
  facebook: string;
  status: "Ativo" | "Inativo";
}

export interface NovoParticipante {
  nome: string;
  idade: number;
  tiktok: string;
  youtube: string;
  facebook: string;
  senha: string;
}

export interface Registro {
  id: number;
  participanteId: string;
  data: string;
  viewsTiktok: number;
  viewsYoutube: number;
  viewsFacebook: number;
  cortes: number;
  links?: string;
}

export interface NovoRegistro {
  participanteId: string;
  data: string;
  viewsTiktok: number;
  viewsYoutube: number;
  viewsFacebook: number;
  cortes: number;
  links?: string;
}

export interface HistoricoParticipante {
  vitorias: number;
  melhorPosicao: number | null;
}

export interface RankingRow {
  pos: number;
  id: string;
  nome: string;
  viewsTiktok: number;
  viewsYoutube: number;
  viewsFacebook: number;
  total: number;
  conteudos: number;
}

export interface EventoStats {
  nome: string;
  liga: string;
  ultimaAtualizacao: string;
}

export interface ConfiguracoesStatus {
  limiteParticipantes: number | null;
  inscricoesFechadasManualmente: boolean;
  totalParticipantes: number;
  inscricoesAbertas: boolean;
}
