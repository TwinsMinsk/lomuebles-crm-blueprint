
import React from "react";
import { Container } from "@/components/ui/container";
import SuppliersContent from "@/components/suppliers/SuppliersContent";
import PageHeader from "@/components/common/PageHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Suppliers = () => {
  return (
    <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
      <Container>
        <PageHeader
          title="Поставщики"
          description="Управление базой данных поставщиков"
        />
        <SuppliersContent />
      </Container>
    </ProtectedRoute>
  );
};

export default Suppliers;
