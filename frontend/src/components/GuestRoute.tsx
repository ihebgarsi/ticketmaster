import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <p>Loading…</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
