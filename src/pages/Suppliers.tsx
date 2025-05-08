
import React from "react";
import { Container } from "@/components/ui/container";
import SuppliersContent from "@/components/suppliers/SuppliersContent";
import PageHeader from "@/components/common/PageHeader";

const Suppliers = () => {
  return (
    <Container>
      <PageHeader
        title="Поставщики"
        description="Управление базой данных поставщиков"
      />
      <SuppliersContent />
    </Container>
  );
};

export default Suppliers;
