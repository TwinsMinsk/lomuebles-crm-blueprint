
import React, { useState } from "react";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import ModernSuppliersTable from "./ModernSuppliersTable";
import SupplierFilters from "./SupplierFilters";
import SupplierFormModal from "./SupplierFormModal";
import DeleteSupplierDialog from "./DeleteSupplierDialog";
import TestDataButton from "./TestDataButton";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus, Truck } from "lucide-react";
import { useSuppliersState } from "@/hooks/useSuppliersState";
import SuppliersPagination from "./SuppliersPagination";
import { Supplier } from "@/types/supplier";
import { useSupplierDelete } from "@/hooks/useSupplierDelete";

const SuppliersContent = () => {
  const {
    suppliers,
    loading,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    refetchSuppliers
  } = useSuppliersState();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteSupplier, loading: deleteLoading } = useSupplierDelete(() => {
    handleDeleteSuccess();
  });

  const handleCreateClick = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleFormSuccess = () => {
    refetchSuppliers();
    setIsFormOpen(false);
  };

  const handleDeleteSuccess = () => {
    refetchSuppliers();
    setIsDeleteDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleConfirmDelete = () => {
    if (selectedSupplier) {
      deleteSupplier(selectedSupplier.supplier_id);
    }
  };

  console.log('Suppliers data:', suppliers);
  console.log('Suppliers count:', suppliers.length);

  return (
    <div className="space-y-6">
      <ModernCard variant="glass">
        <ModernCardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Фильтры поставщиков
              </ModernCardTitle>
              <p className="text-gray-600 mt-1">
                Поиск и фильтрация поставщиков
              </p>
            </div>
            <div className="hidden lg:block">
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить поставщика
              </Button>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            <SupplierFilters 
              filters={filters} 
              setFilters={setFilters} 
            />
            <div className="flex justify-center">
              <TestDataButton onDataChanged={refetchSuppliers} />
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Список поставщиков
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ModernSuppliersTable 
            suppliers={suppliers} 
            loading={loading} 
            onSupplierClick={handleSupplierClick}
            onDeleteClick={handleDeleteClick}
          />
        </ModernCardContent>
      </ModernCard>
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          <SuppliersPagination 
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
        label="Добавить поставщика"
      />

      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        supplier={selectedSupplier}
        onSuccess={handleFormSuccess}
      />

      <DeleteSupplierDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default SuppliersContent;
