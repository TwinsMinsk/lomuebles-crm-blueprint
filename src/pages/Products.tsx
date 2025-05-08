
import React from "react";
import { Container } from "@/components/ui/container";
import ProductsContent from "@/components/products/ProductsContent";
import PageHeader from "@/components/common/PageHeader";

const Products = () => {
  return (
    <Container>
      <PageHeader
        title="Товары CRM"
        description="Управление внутренним каталогом товаров"
      />
      <ProductsContent />
    </Container>
  );
};

export default Products;
