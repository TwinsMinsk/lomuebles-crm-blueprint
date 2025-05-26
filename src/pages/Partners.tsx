
import React from "react";
import { Container } from "@/components/ui/container";
import PartnersContent from "@/components/partners/PartnersContent";
import PageHeader from "@/components/common/PageHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Partners = () => {
  return (
    <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
      <Container>
        <PageHeader
          title="Партнеры-Изготовители"
          description="Управление базой данных партнеров и изготовителей"
        />
        <PartnersContent />
      </Container>
    </ProtectedRoute>
  );
};

export default Partners;
