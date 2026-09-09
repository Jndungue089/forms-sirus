import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type {
  EventoStats,
  HistoricoParticipante,
  NovoParticipante,
  NovoRegistro,
  Participante,
  RankingRow,
  Registro,
} from "../data";

const EVENTO_VAZIO: EventoStats = { nome: "", liga: "", ultimaAtualizacao: "" };

interface DataContextValue {
  loading: boolean;
  error: string | null;
  participantes: Participante[];
  registros: Registro[];
  ranking: RankingRow[];
  historico: Record<string, HistoricoParticipante>;
  eventoStats: EventoStats;
  inscricoesAbertas: boolean;
  limiteParticipantes: number | null;
  inscricoesFechadasManualmente: boolean;
  getParticipante: (id: string) => Participante | undefined;
  addParticipante: (p: NovoParticipante) => Promise<string>;
  updateParticipante: (id: string, patch: Partial<NovoParticipante> & { status?: Participante["status"] }) => Promise<void>;
  deleteParticipante: (id: string) => Promise<void>;
  addRegistro: (r: NovoRegistro) => Promise<void>;
  updateRegistro: (id: number, patch: Partial<NovoRegistro>) => Promise<void>;
  deleteRegistro: (id: number) => Promise<void>;
  updateHistorico: (participanteId: string, h: HistoricoParticipante) => Promise<void>;
  updateConfiguracoes: (patch: { limiteParticipantes?: number | null; inscricoesFechadasManualmente?: boolean }) => Promise<void>;
  updateEventoStats: (patch: Partial<EventoStats>) => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [historico, setHistorico] = useState<Record<string, HistoricoParticipante>>({});
  const [eventoStats, setEventoStats] = useState<EventoStats>(EVENTO_VAZIO);
  const [limiteParticipantes, setLimiteParticipantes] = useState<number | null>(null);
  const [inscricoesFechadasManualmente, setInscricoesFechadasManualmente] = useState(false);
  const [inscricoesAbertas, setInscricoesAbertas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const [p, r, h, ev, cfg] = await Promise.all([
      api.getParticipantes(),
      api.getRegistros(),
      api.getHistorico(),
      api.getEvento(),
      api.getConfiguracoes(),
    ]);
    setParticipantes(p);
    setRegistros(r);
    setHistorico(h);
    setEventoStats(ev);
    setLimiteParticipantes(cfg.limiteParticipantes);
    setInscricoesFechadasManualmente(cfg.inscricoesFechadasManualmente);
    setInscricoesAbertas(cfg.inscricoesAbertas);
    setError(null);
  };

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch((e) => setError(e instanceof Error ? e.message : "Não foi possível ligar ao servidor."))
      .finally(() => setLoading(false));
  }, []);

  const getParticipante = (id: string) => participantes.find((p) => p.id.toLowerCase() === id.toLowerCase());

  const addParticipante = async (novo: NovoParticipante) => {
    const criado = await api.addParticipante(novo);
    await refresh();
    return criado.id;
  };

  const updateParticipante = async (id: string, patch: Partial<NovoParticipante> & { status?: Participante["status"] }) => {
    await api.updateParticipante(id, patch);
    await refresh();
  };

  const deleteParticipante = async (id: string) => {
    await api.deleteParticipante(id);
    await refresh();
  };

  const addRegistro = async (novo: NovoRegistro) => {
    await api.addRegistro(novo);
    await refresh();
  };

  const updateRegistro = async (id: number, patch: Partial<NovoRegistro>) => {
    await api.updateRegistro(id, patch);
    await refresh();
  };

  const deleteRegistro = async (id: number) => {
    await api.deleteRegistro(id);
    await refresh();
  };

  const updateHistorico = async (participanteId: string, h: HistoricoParticipante) => {
    await api.setHistorico(participanteId, h);
    await refresh();
  };

  const updateConfiguracoes = async (patch: { limiteParticipantes?: number | null; inscricoesFechadasManualmente?: boolean }) => {
    await api.updateConfiguracoes(patch);
    await refresh();
  };

  const updateEventoStats = async (patch: Partial<EventoStats>) => {
    await api.updateEvento(patch);
    await refresh();
  };

  const ranking = useMemo<RankingRow[]>(() => {
    const agregados = new Map<string, { viewsTiktok: number; viewsYoutube: number; viewsFacebook: number; conteudos: number }>();
    for (const r of registros) {
      const atual = agregados.get(r.participanteId) ?? { viewsTiktok: 0, viewsYoutube: 0, viewsFacebook: 0, conteudos: 0 };
      atual.viewsTiktok += r.viewsTiktok;
      atual.viewsYoutube += r.viewsYoutube;
      atual.viewsFacebook += r.viewsFacebook;
      atual.conteudos += r.cortes;
      agregados.set(r.participanteId, atual);
    }

    return participantes
      .filter((p) => agregados.has(p.id))
      .map((p) => {
        const a = agregados.get(p.id)!;
        return {
          id: p.id,
          nome: p.nome,
          viewsTiktok: a.viewsTiktok,
          viewsYoutube: a.viewsYoutube,
          viewsFacebook: a.viewsFacebook,
          total: a.viewsTiktok + a.viewsYoutube + a.viewsFacebook,
          conteudos: a.conteudos,
        };
      })
      .sort((a, b) => b.total - a.total)
      .map((l, i) => ({ pos: i + 1, ...l }));
  }, [participantes, registros]);

  return (
    <DataContext.Provider
      value={{
        loading,
        error,
        participantes,
        registros,
        ranking,
        historico,
        eventoStats,
        inscricoesAbertas,
        limiteParticipantes,
        inscricoesFechadasManualmente,
        getParticipante,
        addParticipante,
        updateParticipante,
        deleteParticipante,
        addRegistro,
        updateRegistro,
        deleteRegistro,
        updateHistorico,
        updateConfiguracoes,
        updateEventoStats,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
  return ctx;
}
