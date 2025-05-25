
import React, { useState } from "react";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import ModernPartnersTable from "./ModernPartnersTable";
import PartnerFilters from "./PartnerFilters";
import PartnerFormModal from "./PartnerFormModal";
import DeletePartnerDialog from "./DeletePartnerDialog";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus, Building2 } from "lucide-react";
import { usePartnersState } from "@/hooks/usePartnersState";
import PartnersPagination from "./PartnersPagination";
import { Partner } from "@/types/partner";
import { usePartnerDelete } from "@/hooks/usePartnerDelete";

const PartnersContent = () => {
  const {
    partners,
    loading,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    refetchPartners
  } = usePartnersState();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deletePartner, loading: deleteLoading } = usePartnerDelete(() => {
    handleDeleteSuccess();
  });

  const handleCreateClick = () => {
    setSelectedPartner(null);
    setIsFormOpen(true);
  };

  const handlePartnerClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleFormSuccess = () => {
    refetchPartners();
    setIsFormOpen(false);
  };

  const handleDeleteSuccess = () => {
    refetchPartners();
    setIsDeleteDialogOpen(false);
    setSelectedPartner(null);
  };

  const handleConfirmDelete = () => {
    if (selectedPartner) {
      deletePartner(selectedPartner.partner_manufacturer_id);
    }
  };

  return (
    <div className="space-y-6">
      <ModernCard variant="glass">
        <ModernCardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Фильтры партнеров
              </ModernCardTitle>
              <p className="text-gray-600 mt-1">
                Поиск и фильтрация партнеров-изготовителей
              </p>
            </div>
            <div className="hidden lg:block">
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить партнера
              </Button>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <PartnerFilters 
            filters={filters} 
            setFilters={setFilters} 
          />
        </ModernCardContent>
      </ModernCard>

      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Список партнеров
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ModernPartnersTable 
            partners={partners} 
            loading={loading} 
            onPartnerClick={handlePartnerClick}
            onDeleteClick={handleDeleteClick}
          />
        </ModernCardContent>
      </ModernCard>
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PartnersPagination 
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
        label="Добавить партнера"
      />

      <PartnerFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        partner={selectedPartner}
        onSuccess={handleFormSuccess}
      />

      <DeletePartnerDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        partner={selectedPartner}
      />
    </div>
  );
};

export default PartnersContent;
