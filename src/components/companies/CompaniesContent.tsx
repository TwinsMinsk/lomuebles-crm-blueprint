
import React, { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Company } from "@/hooks/useCompanies";
import CompaniesTable from "./CompaniesTable";
import CompaniesPagination from "./CompaniesPagination";
import CompanyFilters from "./CompanyFilters";
import CompanyFormModal from "./CompanyFormModal";
import DeleteCompanyDialog from "./DeleteCompanyDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompaniesContentProps {
  companies: Company[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  handleSort: (column: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  industryFilter: string;
  setIndustryFilter: (value: string) => void;
  ownerFilter: string;
  setOwnerFilter: (value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  handleResetFilters: () => void;
  refetch: () => void;
  users: Array<{ id: string; full_name: string }>;
  industries: Array<{ value: string; label: string }>;
}

const CompaniesContent: React.FC<CompaniesContentProps> = ({
  companies,
  loading,
  totalPages,
  currentPage,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
  searchTerm,
  setSearchTerm,
  industryFilter,
  setIndustryFilter,
  ownerFilter,
  setOwnerFilter,
  showFilters,
  toggleFilters,
  handleResetFilters,
  refetch,
  users,
  industries
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('company_id', companyToDelete.company_id);

      if (error) {
        throw error;
      }

      toast({
        title: "Компания удалена",
        description: `Компания "${companyToDelete.company_name}" успешно удалена.`,
      });
      
      // Close the dialog and refresh the data
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Ошибка при удалении",
        description: "Не удалось удалить компанию. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <CompanyFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
            ownerFilter={ownerFilter}
            setOwnerFilter={setOwnerFilter}
            showFilters={showFilters}
            toggleFilters={toggleFilters}
            handleResetFilters={handleResetFilters}
            industryOptions={industries}
            users={users}
          />
        </div>
        <div className="ml-4">
          <Button 
            className="flex items-center gap-2" 
            onClick={handleAddCompany}
          >
            <Plus className="h-4 w-4" /> Добавить компанию
          </Button>
        </div>
      </div>
    
      <CompaniesTable 
        companies={companies}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEditCompany={handleEditCompany}
        onDeleteCompany={handleDeleteCompany}
      />
      
      {totalPages > 1 && (
        <div className="mt-4">
          <CompaniesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Company Form Modal */}
      <CompanyFormModal
        company={selectedCompany}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        users={users}
      />

      {/* Delete Company Dialog */}
      <DeleteCompanyDialog
        company={companyToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default CompaniesContent;
