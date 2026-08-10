import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { hasValidSession } from "@/utils/adminSession";

/**
 * Libera a rota apenas com sessão válida no Supabase Auth.
 * A verificação é assíncrona porque pode envolver um refresh do token.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    hasValidSession().then((valid) => {
      if (active) setAllowed(valid);
    });
    return () => {
      active = false;
    };
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!allowed) return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
