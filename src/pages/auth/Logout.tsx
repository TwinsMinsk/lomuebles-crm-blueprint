
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Logout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      navigate("/auth/login", { replace: true });
    };
    
    performLogout();
  }, [signOut, navigate]);

  // Показываем заглушку пока происходит выход из системы
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Выполняется выход из системы...</p>
    </div>
  );
};

export default Logout;
