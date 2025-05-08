
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import SuppliersTable from "./SuppliersTable";
import SupplierFilters from "./SupplierFilters";
import SupplierFormModal from "./SupplierFormModal";
import DeleteSupplierDialog from "./DeleteSupplierDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button onClick={handleCreateClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Добавить поставщика</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <SupplierFilters 
          filters={filters} 
          setFilters={setFilters} 
        />
      </Card>

      <Card className="p-0">
        <SuppliersTable 
          suppliers={suppliers} 
          loading={loading} 
          onSupplierClick={handleSupplierClick}
          onDeleteClick={handleDeleteClick}
        />
      </Card>
      
      {totalPages > 1 && (
        <SuppliersPagination 
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}

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
