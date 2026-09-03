import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { participanteId } = useAuth();
  if (!participanteId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
