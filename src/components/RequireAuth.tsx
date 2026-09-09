import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { participanteId, isAdmin } = useAuth();
  if (!participanteId) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/area" replace />;
  return <>{children}</>;
}
