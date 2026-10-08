// Cliente HTTP para o backend (repo forms-sirus-back, NestJS + Postgres).
// Chama sempre `/api` na mesma origem, por isso não é preciso CORS: em desenvolvimento
// o Vite faz proxy para o servidor local (vite.config.ts) e em produção a Vercel faz
// rewrite para o backend (vercel.json).

import type {
  ConfiguracoesStatus,
  EventoStats,
  HistoricoParticipante,
  NovoParticipante,
  NovoRegistro,
  Participante,
  Registro,
} from "../data";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Erro ${res.status} ao comunicar com o servidor.`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // resposta sem corpo JSON
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

interface LoginResponse {
  ok: boolean;
  isAdmin: boolean;
  participanteId: string;
}

export const api = {
  login: (id: string, senha: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify({ id, senha }) }),
  alterarSenhaAdmin: (id: string, senhaAtual: string, novaSenha: string) =>
    request<{ ok: boolean }>("/auth/alterar-senha-admin", { method: "POST", body: JSON.stringify({ id, senhaAtual, novaSenha }) }),

  getParticipantes: () => request<Participante[]>("/participantes"),
  addParticipante: (data: NovoParticipante) =>
    request<Participante>("/participantes", { method: "POST", body: JSON.stringify(data) }),
  updateParticipante: (id: string, data: Partial<NovoParticipante> & { status?: Participante["status"] }) =>
    request<Participante>(`/participantes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteParticipante: (id: string) => request<void>(`/participantes/${id}`, { method: "DELETE" }),

  getRegistros: () => request<Registro[]>("/registros"),
  addRegistro: (data: NovoRegistro) => request<Registro>("/registros", { method: "POST", body: JSON.stringify(data) }),
  updateRegistro: (id: number, data: Partial<NovoRegistro>) =>
    request<Registro>(`/registros/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteRegistro: (id: number) => request<void>(`/registros/${id}`, { method: "DELETE" }),

  getHistorico: () => request<Record<string, HistoricoParticipante>>("/historico"),
  setHistorico: (participanteId: string, data: HistoricoParticipante) =>
    request<HistoricoParticipante & { participanteId: string }>(`/historico/${participanteId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getConfiguracoes: () => request<ConfiguracoesStatus>("/configuracoes"),
  updateConfiguracoes: (
    data: Partial<Pick<ConfiguracoesStatus, "limiteParticipantes" | "inscricoesFechadasManualmente" | "ocultarTop3" | "bloqueioTotal">>
  ) => request<ConfiguracoesStatus>("/configuracoes", { method: "PATCH", body: JSON.stringify(data) }),

  getEvento: () => request<EventoStats>("/evento"),
  updateEvento: (data: Partial<EventoStats>) => request<EventoStats>("/evento", { method: "PATCH", body: JSON.stringify(data) }),
};
