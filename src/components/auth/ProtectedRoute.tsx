
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string | string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/login"
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
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Проверяем, имеет ли пользователь требуемую роль
    if (userRole && !roles.includes(userRole)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
