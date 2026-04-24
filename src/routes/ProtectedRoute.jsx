import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageSpinner from "../components/FullPageSpinner";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!user || !token) {
    console.warn("[Guard] → /login (no user/token)", {
      hasUser: !!user,
      hasToken: !!token,
      path: location.pathname,
      tokenInLS: !!localStorage.getItem("token"),
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.isVerified === false) {
    console.warn("[Guard] → /login (isVerified=false)");
    return <Navigate to="/login" replace />;
  }

  const allowed = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole
      ? [requiredRole]
      : null;

  const activeRole = user.primaryRole || "user";

  if (allowed && !allowed.includes(activeRole)) {
    console.warn("[Guard] → /forbidden (role mismatch)", {
      allowed,
      activeRole,
      roles: user.roles,
      path: location.pathname,
    });
    return <Navigate to="/forbidden" replace />;
  }

  console.debug("[Guard] ✓ allowed", {
    path: location.pathname,
    activeRole,
    roles: user.roles,
    requiredRole: allowed,
  });

  return children;
};

export default ProtectedRoute;
