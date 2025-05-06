
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadsPagination from "@/components/leads/LeadsPagination";
import { useLeads } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LeadFormModal from "@/components/leads/LeadFormModal";
import { LeadWithProfile } from "@/components/leads/LeadTableRow";

const Leads = () => {
  const { leads, loading, page, totalPages, setPage, refreshLeads } = useLeads();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithProfile | undefined>(undefined);

  const handleAddLead = () => {
    setSelectedLead(undefined);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: LeadWithProfile) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(undefined);
  };

  const handleSuccess = () => {
    refreshLeads();
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Лиды</CardTitle>
          <Button onClick={handleAddLead}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить лид
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <LeadsTable 
                leads={leads} 
                loading={loading} 
                onLeadClick={handleEditLead}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <LeadsPagination 
                  page={page} 
                  totalPages={totalPages} 
                  setPage={setPage} 
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Leads;
