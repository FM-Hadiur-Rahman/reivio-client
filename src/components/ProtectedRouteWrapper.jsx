// src/components/ProtectedRouteWrapper.jsx
import React from "react";
import ProtectedRoute from "../routes/ProtectedRoute";

const ProtectedRouteWrapper = ({ children, role }) => {
  return <ProtectedRoute requiredRole={role}>{children}</ProtectedRoute>;
};

export default ProtectedRouteWrapper;
