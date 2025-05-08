
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import PartnersTable from "./PartnersTable";
import PartnerFilters from "./PartnerFilters";
import PartnerFormModal from "./PartnerFormModal";
import DeletePartnerDialog from "./DeletePartnerDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button onClick={handleCreateClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Добавить партнера</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <PartnerFilters 
          filters={filters} 
          setFilters={setFilters} 
        />
      </Card>

      <Card className="p-0">
        <PartnersTable 
          partners={partners} 
          loading={loading} 
          onPartnerClick={handlePartnerClick}
          onDeleteClick={handleDeleteClick}
        />
      </Card>
      
      {totalPages > 1 && (
        <PartnersPagination 
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}

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
