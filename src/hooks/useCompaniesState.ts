
import { useCompanies, useUsers, useIndustries } from "./useCompanies";
import { usePaginationAndSort } from "./companies/usePaginationAndSort";
import { useCompaniesFilter } from "./companies/useCompaniesFilter";
import { useCompanyFormModal } from "./companies/useCompanyFormModal";
import { useCompanyDelete } from "./companies/useCompanyDelete";

export const useCompaniesState = () => {
  // Use the smaller hooks
  const { 
    currentPage, 
    sortColumn, 
    sortDirection, 
    handlePageChange, 
    handleSort,
    calculateTotalPages
  } = usePaginationAndSort();

  const {
    searchTerm,
    setSearchTerm,
    industryFilter,
    setIndustryFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters
  } = useCompaniesFilter();

  const {
    isFormOpen,
    selectedCompany,
    handleAddCompany,
    handleEditCompany,
    handleCloseForm
  } = useCompanyFormModal();

  const {
    isDeleteDialogOpen,
    companyToDelete,
    handleDeleteCompany,
    handleConfirmDelete,
    handleCloseDeleteDialog
  } = useCompanyDelete();

  // Fetch users for the owner filter
  const { users } = useUsers();
  
  // Fetch industries for the industry filter
  const { industries } = useIndustries();
  
  // Use the useCompanies hook to fetch data with filters applied
  const { companies, count, loading, refetch } = useCompanies(
    currentPage,
    10, // pageSize
    sortColumn,
    sortDirection,
    searchTerm,
    industryFilter,
    ownerFilter
  );

  // Calculate total pages based on count
  const totalPages = calculateTotalPages(count, 10);

  const handleFormSuccess = () => {
    refetch();
  };

  const handleConfirmDeleteWithRefetch = () => {
    handleConfirmDelete(refetch);
  };

  return {
    // Pagination and sorting
    companies,
    loading,
    totalPages,
    currentPage,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    refetch,
    
    // Filtering
    searchTerm,
    setSearchTerm,
    industryFilter,
    setIndustryFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters,
    
    // Users and industries data
    users,
    industries,
    
    // Form modal
    isFormOpen,
    selectedCompany,
    handleAddCompany,
    handleEditCompany,
    handleCloseForm,
    handleFormSuccess,
    
    // Delete functionality
    isDeleteDialogOpen,
    companyToDelete,
    handleDeleteCompany,
    handleConfirmDeleteWithRefetch,
    handleCloseDeleteDialog
  };
};
