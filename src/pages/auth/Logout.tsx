
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Logout = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut();
  }, [signOut]);

  // Перенаправляем на страницу логина
  return <Navigate to="/auth/login" replace />;
};

export default Logout;
