
import React from "react";
import { Container } from "@/components/ui/container";
import PartnersContent from "@/components/partners/PartnersContent";
import PageHeader from "@/components/common/PageHeader";

const Partners = () => {
  return (
    <Container>
      <PageHeader
        title="Партнеры-Изготовители"
        description="Управление базой данных партнеров и изготовителей"
      />
      <PartnersContent />
    </Container>
  );
};

export default Partners;
