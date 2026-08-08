import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("festiva_admin") === "true";
  const hasToken = localStorage.getItem("festiva_admin_token");
  
  if (!isAuthenticated || !hasToken) {
    // Clear stale session data
    localStorage.removeItem("festiva_admin");
    localStorage.removeItem("festiva_admin_token");
    localStorage.removeItem("festiva_admin_id");
    localStorage.removeItem("festiva_admin_email");
    localStorage.removeItem("festiva_admin_name");
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
