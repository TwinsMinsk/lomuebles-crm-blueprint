
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  requiredRole?: string | string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = "/auth/login"
}) => {
  const { user, isLoading, userRole } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  }

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Если требуется определенная роль
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Проверяем, имеет ли пользователь требуемую роль
    if (userRole && !roles.includes(userRole)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
