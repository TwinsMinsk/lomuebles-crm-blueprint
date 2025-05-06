
import React from "react";
import { Loader2, Plus } from "lucide-react";
import { Company } from "@/hooks/useCompanies";
import CompaniesTable from "./CompaniesTable";
import CompaniesPagination from "./CompaniesPagination";
import CompanyFilters from "./CompanyFilters";
import CompanyFormModal from "./CompanyFormModal";
import DeleteCompanyDialog from "./DeleteCompanyDialog";
import { Button } from "@/components/ui/button";

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
  // Form modal properties
  isFormOpen: boolean;
  selectedCompany: Company | null;
  handleAddCompany: () => void;
  handleEditCompany: (company: Company) => void;
  handleCloseForm: () => void;
  handleFormSuccess: () => void;
  // Delete dialog properties
  isDeleteDialogOpen: boolean;
  companyToDelete: Company | null;
  handleDeleteCompany: (company: Company) => void;
  handleConfirmDeleteWithRefetch: () => void;
  handleCloseDeleteDialog: () => void;
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
  industries,
  // Form modal properties
  isFormOpen,
  selectedCompany,
  handleAddCompany,
  handleEditCompany,
  handleCloseForm,
  handleFormSuccess,
  // Delete dialog properties
  isDeleteDialogOpen,
  companyToDelete,
  handleDeleteCompany,
  handleConfirmDeleteWithRefetch,
  handleCloseDeleteDialog
}) => {
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
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteWithRefetch}
      />
    </>
  );
};

export default CompaniesContent;
