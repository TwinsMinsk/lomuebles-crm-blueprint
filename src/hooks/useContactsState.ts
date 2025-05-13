
import { toast } from "@/components/ui/use-toast";
import { useContacts } from "@/hooks/useContacts";
import { usePaginationAndSort } from "./contacts/usePaginationAndSort";
import { useContactsFilter } from "./contacts/useContactsFilter";
import { useContactFormModal } from "./contacts/useContactFormModal";
import { useContactDelete } from "./contacts/useContactDelete";
import { useFilterOptions } from "./contacts/useFilterOptions";

export function useContactsState() {
  // Get pagination and sorting hooks
  const {
    currentPage,
    setCurrentPage,
    sortColumn,
    sortDirection,
    handlePageChange,
    handleSort
  } = usePaginationAndSort();

  // Get filtering hooks
  const {
    searchTerm,
    setSearchTerm,
    companyFilter,
    setCompanyFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters: resetFilters
  } = useContactsFilter();

  // Page size is constant for now
  const pageSize = 10;

  // Get contacts with filters and sorting
  const { contacts, loading, totalPages, error, refetch } = useContacts({ 
    page: currentPage, 
    pageSize,
    sortColumn,
    sortDirection,
    search: searchTerm,
    companyFilter,
    ownerFilter
  });

  // Get contact form modal hooks
  const {
    isFormModalOpen,
    contactToEdit,
    handleAddContact,
    handleEditContact,
    handleModalClose
  } = useContactFormModal();

  // Get contact delete hooks
  const {
    isDeleteDialogOpen,
    contactToDelete,
    isDeleting,
    handleDeleteContact,
    handleConfirmDelete,
    handleCloseDeleteDialog
  } = useContactDelete({
    onDeleteSuccess: refetch
  });

  // Get filter options
  const { companies, users } = useFilterOptions();

  // Reset filters and sorting
  const handleResetFilters = () => {
    resetFilters();
    setCurrentPage(1);
  };
  
  // Handle contact saved
  const handleContactSaved = () => {
    // Refresh the contacts list
    refetch();
  };

  // Show error toast if data fetching fails
  if (error) {
    toast.error("Ошибка при загрузке контактов", {
      description: error.message
    });
  }

  return {
    contacts,
    loading,
    totalPages,
    currentPage,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    searchTerm,
    setSearchTerm,
    companyFilter,
    setCompanyFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters,
    companies,
    users,
    isFormModalOpen,
    contactToEdit,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    handleModalClose,
    handleContactSaved,
    isDeleteDialogOpen,
    contactToDelete,
    isDeleting,
    handleConfirmDelete,
    handleCloseDeleteDialog
  };
}
