import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LeafLogo } from "@/components/icons";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <LeafLogo className="h-8 w-8 animate-pulse text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
