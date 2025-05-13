
import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/useLeads";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadFormModal from "@/components/leads/LeadFormModal";
import LeadsPagination from "@/components/leads/LeadsPagination";
import { LeadWithProfile } from "@/components/leads/LeadTableRow";
import DeleteLeadDialog from "@/components/leads/DeleteLeadDialog";
import { useLeadDelete } from "@/hooks/useLeadDelete";

const Leads: React.FC = () => {
  const { leads, loading, page, totalPages, setPage, refreshLeads } = useLeads();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteLead, isDeleting } = useLeadDelete();

  const handleLeadClick = (lead: LeadWithProfile) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedLead(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLead(null);
  };

  const handleDeleteLead = (lead: LeadWithProfile) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLead) {
      deleteLead(selectedLead.lead_id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <PageHeader
        title="Лиды"
        description="Управление потенциальными клиентами"
        action={
          <Button onClick={handleAddNewClick}>Новый лид</Button>
        }
      />

      <LeadsTable
        leads={leads}
        loading={loading}
        onLeadClick={handleLeadClick}
        onLeadDelete={handleDeleteLead}
      />

      <LeadsPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      <LeadFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        lead={selectedLead}
        onSuccess={refreshLeads}
      />

      <DeleteLeadDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        lead={selectedLead}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Leads;
