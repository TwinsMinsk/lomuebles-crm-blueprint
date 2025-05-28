
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/useLeads";
import ModernLeadsTable from "@/components/leads/ModernLeadsTable";
import LeadFormModal from "@/components/leads/LeadFormModal";
import LeadsPagination from "@/components/leads/LeadsPagination";
import { LeadWithProfile } from "@/components/leads/LeadTableRow";
import DeleteLeadDialog from "@/components/leads/DeleteLeadDialog";
import { useLeadDelete } from "@/hooks/useLeadDelete";
import { ModernHeader } from "@/components/ui/modern-header";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus, Users } from "lucide-react";

const Leads: React.FC = () => {
  const [page, setPage] = useState(1);
  const { leads, loading, totalPages, refreshLeads } = useLeads({ page, pageSize: 10 });
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

  const breadcrumbs = [
    { label: "CRM", href: "/dashboard" },
    { label: "Лиды" }
  ];

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <ModernHeader
        title="Лиды"
        description="Управление потенциальными клиентами"
        breadcrumbs={breadcrumbs}
        action={
          <Button 
            onClick={handleAddNewClick}
            className="hidden lg:flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Новый лид
          </Button>
        }
      />

      <div className="space-y-6">
        <ModernLeadsTable
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
      </div>

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={handleAddNewClick}
        icon={<Plus className="h-6 w-6" />}
        label="Новый лид"
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
