
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useContacts } from "@/hooks/useContacts";
import { toast } from "sonner";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

export function useContactsState() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [contactToEdit, setContactToEdit] = useState<ContactWithRelations | undefined>(undefined);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<ContactWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Options for dropdowns
  const [companies, setCompanies] = useState<{company_id: number; company_name: string}[]>([]);
  const [users, setUsers] = useState<{id: string; full_name: string}[]>([]);

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

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCompanyFilter('all');
    setOwnerFilter('all');
    setSortColumn(undefined);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Open add contact modal
  const handleAddContact = () => {
    setContactToEdit(undefined);
    setIsFormModalOpen(true);
  };
  
  // Handle edit contact
  const handleEditContact = (contact: ContactWithRelations) => {
    setContactToEdit(contact);
    setIsFormModalOpen(true);
  };
  
  // Handle delete contact (open dialog)
  const handleDeleteContact = (contact: ContactWithRelations) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async (contactId: number) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('contact_id', contactId);
      
      if (error) throw error;
      
      toast.success("Контакт успешно удален");
      refetch(); // Refresh contacts list
      setIsDeleteDialogOpen(false);
      
    } catch (err) {
      console.error("Error deleting contact:", err);
      toast.error("Ошибка при удалении контакта", {
        description: err instanceof Error ? err.message : "Неизвестная ошибка"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle close modal
  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setContactToEdit(undefined);
  };
  
  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setContactToDelete(null);
  };
  
  // Handle contact saved
  const handleContactSaved = () => {
    // Refresh the contacts list
    refetch();
  };

  // Fetch filter options
  useEffect(() => {
    // Fetch companies for filter
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('company_id, company_name')
          .order('company_name');
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    
    // Fetch users for filter
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    
    fetchCompanies();
    fetchUsers();
  }, []);

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
