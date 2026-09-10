import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../lib/api";

interface AuthContextValue {
  participanteId: string | null;
  isAdmin: boolean;
  login: (id: string, senha: string) => Promise<boolean>;
  logout: () => void;
  alterarSenhaAdmin: (senhaAtual: string, novaSenha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async (id: string, senha: string) => {
    const res = await api.login(id.trim(), senha);
    setParticipanteId(res.participanteId);
    setIsAdmin(res.isAdmin);
    return res.isAdmin;
  };

  const logout = () => {
    setParticipanteId(null);
    setIsAdmin(false);
  };

  const alterarSenhaAdmin = async (senhaAtual: string, novaSenha: string) => {
    await api.alterarSenhaAdmin(participanteId || "ADMIN", senhaAtual, novaSenha);
  };

  return (
    <AuthContext.Provider value={{ participanteId, isAdmin, login, logout, alterarSenhaAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
