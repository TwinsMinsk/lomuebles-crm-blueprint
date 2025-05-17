
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
    console.log("Protected route: User not authenticated, redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Если требуется определенная роль
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Проверяем, имеет ли пользователь требуемую роль
    if (userRole && !roles.includes(userRole)) {
      console.log(`Access denied: User role ${userRole} not in allowed roles [${roles.join(', ')}]`);
      return <Navigate to="/access-denied" replace />;
    }
    
    // Если роль не определена (userRole === null), но требуется проверка роли
    if (userRole === null && allowedRoles) {
      console.log("User role is null, but route requires specific role");
      // Ожидаем загрузку роли, показываем индикатор загрузки
      return <div className="flex items-center justify-center h-screen">Проверка доступа...</div>;
    }
  }

  console.log("Protected route: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
