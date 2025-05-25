
import React, { useState } from "react";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import ModernProductsTable from "./ModernProductsTable";
import ProductFilters from "./ProductFilters";
import ProductFormModal from "./ProductFormModal";
import DeleteProductDialog from "./DeleteProductDialog";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus, Package } from "lucide-react";
import { useProductsState } from "@/hooks/useProductsState";
import ProductsPagination from "./ProductsPagination";
import { Product } from "@/types/product";
import { useProductDelete } from "@/hooks/useProductDelete";

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

  const { deleteProduct, loading: deleteLoading } = useProductDelete(() => {
    handleDeleteSuccess();
  });

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

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.product_id);
    }
  };

  return (
    <div className="space-y-6">
      <ModernCard variant="glass">
        <ModernCardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Фильтры товаров
              </ModernCardTitle>
              <p className="text-gray-600 mt-1">
                Поиск и фильтрация товаров в каталоге CRM
              </p>
            </div>
            <div className="hidden lg:block">
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить товар
              </Button>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <ProductFilters 
            filters={filters} 
            setFilters={setFilters} 
          />
        </ModernCardContent>
      </ModernCard>

      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Каталог товаров CRM
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ModernProductsTable 
            products={products} 
            loading={loading} 
            onProductClick={handleProductClick}
            onDeleteClick={handleDeleteClick}
          />
        </ModernCardContent>
      </ModernCard>
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          <ProductsPagination 
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </div>
      )}

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={handleCreateClick}
        icon={<Plus className="h-6 w-6" />}
        label="Добавить товар"
      />

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        product={selectedProduct}
        onSuccess={handleFormSuccess}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsContent;
