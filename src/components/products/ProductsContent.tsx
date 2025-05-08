
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import ProductsTable from "./ProductsTable";
import ProductFilters from "./ProductFilters";
import ProductFormModal from "./ProductFormModal";
import DeleteProductDialog from "./DeleteProductDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProductsState } from "@/hooks/useProductsState";
import ProductsPagination from "./ProductsPagination";
import { Product } from "@/types/product";

const ProductsContent = () => {
  const {
    products,
    loading,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    refetchProducts
  } = useProductsState();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleFormSuccess = () => {
    refetchProducts();
    setIsFormOpen(false);
  };

  const handleDeleteSuccess = () => {
    refetchProducts();
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button onClick={handleCreateClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Добавить товар</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <ProductFilters 
          filters={filters} 
          setFilters={setFilters} 
        />
      </Card>

      <Card className="p-0">
        <ProductsTable 
          products={products} 
          loading={loading} 
          onProductClick={handleProductClick}
          onDeleteClick={handleDeleteClick}
        />
      </Card>
      
      {totalPages > 1 && (
        <ProductsPagination 
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        product={selectedProduct}
        onSuccess={handleFormSuccess}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteSuccess}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsContent;
