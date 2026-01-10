// src/pages/DashboardPage.jsx
import { useAuth } from "../context/AuthContext";
import FullPageSpinner from "../components/FullPageSpinner";
import GuestDashboard from "../components/GuestDashboard";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner message="Loading dashboard..." />;
  if (!user) return null;

  // Route admins to the admin section (which is admin-guarded)
  if (user.primaryRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Optionally do the same for other roles,
  // so each role stays in its own section:
  if (user.primaryRole === "host") {
    return <Navigate to="/host/dashboard" replace />;
  }
  if (user.primaryRole === "driver") {
    return <Navigate to="/dashboard/driver" replace />;
  }

  // Default user/guest dashboard
  return <GuestDashboard />;
};

export default DashboardPage;
