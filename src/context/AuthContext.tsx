import { createContext, useContext, useState, type ReactNode } from "react";
import { useData } from "./DataContext";

interface AuthContextValue {
  participanteId: string | null;
  login: (id: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getParticipante } = useData();
  const [participanteId, setParticipanteId] = useState<string | null>(null);

  const login = (id: string) => {
    const encontrado = getParticipante(id.trim());
    if (!encontrado) return false;
    setParticipanteId(encontrado.id);
    return true;
  };

  const logout = () => setParticipanteId(null);

  return <AuthContext.Provider value={{ participanteId, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
