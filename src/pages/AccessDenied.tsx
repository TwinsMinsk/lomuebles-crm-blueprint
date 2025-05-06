
import React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Shield } from "lucide-react";

const AccessDenied = () => {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="bg-red-100 p-6 rounded-full mb-6">
          <Shield className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Доступ запрещен</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          У вас нет необходимых прав для доступа к этой странице. Пожалуйста, свяжитесь с
          администратором для получения доступа.
        </p>
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </Container>
  );
};

export default AccessDenied;
