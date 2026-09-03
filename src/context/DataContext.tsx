import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  participantes as participantesIniciais,
  registros as registrosIniciais,
  type Participante,
  type Registro,
  type RankingRow,
} from "../data";

interface NovoParticipante {
  nome: string;
  idade: number;
  tiktok: string;
  youtube: string;
  whatsapp: string;
}

interface NovoRegistro {
  id: string;
  data: string;
  viewsTiktok: number;
  viewsYoutube: number;
  cortes: number;
  links?: string;
}

interface DataContextValue {
  participantes: Participante[];
  registros: Registro[];
  ranking: RankingRow[];
  addParticipante: (p: NovoParticipante) => string;
  addRegistro: (r: NovoRegistro) => void;
  getParticipante: (id: string) => Participante | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

function proximoId(lista: Participante[]): string {
  const numeros = lista.map((p) => parseInt(p.id.replace("VRS", ""), 10)).filter((n) => !isNaN(n));
  const proximo = (numeros.length ? Math.max(...numeros) : 0) + 1;
  return `VRS${String(proximo).padStart(3, "0")}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [participantes, setParticipantes] = useState<Participante[]>(participantesIniciais);
  const [registros, setRegistros] = useState<Registro[]>(registrosIniciais);

  const addParticipante = (novo: NovoParticipante) => {
    const id = proximoId(participantes);
    setParticipantes((atual) => [...atual, { id, status: "Ativo", ...novo }]);
    return id;
  };

  const addRegistro = (novo: NovoRegistro) => {
    setRegistros((atual) => [...atual, novo]);
  };

  const getParticipante = (id: string) => participantes.find((p) => p.id.toLowerCase() === id.toLowerCase());

  const ranking = useMemo<RankingRow[]>(() => {
    const agregados = new Map<string, { viewsTiktok: number; viewsYoutube: number; conteudos: number }>();
    for (const r of registros) {
      const atual = agregados.get(r.id) ?? { viewsTiktok: 0, viewsYoutube: 0, conteudos: 0 };
      atual.viewsTiktok += r.viewsTiktok;
      atual.viewsYoutube += r.viewsYoutube;
      atual.conteudos += r.cortes;
      agregados.set(r.id, atual);
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
          total: a.viewsTiktok + a.viewsYoutube,
          conteudos: a.conteudos,
        };
      })
      .sort((a, b) => b.total - a.total)
      .map((l, i) => ({ pos: i + 1, ...l }));
  }, [participantes, registros]);

  return (
    <DataContext.Provider value={{ participantes, registros, ranking, addParticipante, addRegistro, getParticipante }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
  return ctx;
}
