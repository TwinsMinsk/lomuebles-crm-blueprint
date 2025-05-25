
import React from "react";
import ContactFormModal from "@/components/contacts/ContactFormModal";
import DeleteContactDialog from "@/components/contacts/DeleteContactDialog";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernHeader } from "@/components/ui/modern-header";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactsState } from "@/hooks/useContactsState";
import ContactFilters from "@/components/contacts/ContactFilters";
import ModernContactsTable from "@/components/contacts/ModernContactsTable";

const Contacts = () => {
  const {
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
  } = useContactsState();

  const breadcrumbs = [
    { label: "CRM", href: "/dashboard" },
    { label: "Контакты" }
  ];

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <ModernHeader
        title="Контакты"
        description="Управление контактами клиентов"
        breadcrumbs={breadcrumbs}
        action={
          <Button 
            onClick={handleAddContact}
            className="hidden lg:flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить контакт
          </Button>
        }
      />

      <ModernCard variant="glass">
        <ModernCardHeader className="flex flex-row items-center justify-between">
          <div>
            <ModernCardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Список контактов
            </ModernCardTitle>
            <p className="text-gray-600 mt-1">
              Управление информацией о клиентах и их контактных данных
            </p>
          </div>
          <ContactFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            ownerFilter={ownerFilter}
            setOwnerFilter={setOwnerFilter}
            showFilters={showFilters}
            toggleFilters={toggleFilters}
            handleResetFilters={handleResetFilters}
            companies={companies}
            users={users}
          />
        </ModernCardHeader>
        <ModernCardContent>
          <ModernContactsTable
            contacts={contacts}
            loading={loading}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />

          {/* Pagination would go here if needed */}
        </ModernCardContent>
      </ModernCard>

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={handleAddContact}
        icon={<Plus className="h-6 w-6" />}
        label="Добавить контакт"
      />
      
      {/* Contact form modal */}
      <ContactFormModal 
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        contactToEdit={contactToEdit}
        onContactSaved={handleContactSaved}
      />
      
      {/* Delete confirmation dialog */}
      <DeleteContactDialog
        isOpen={isDeleteDialogOpen}
        contact={contactToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Contacts;
