
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import ContactFormModal from "@/components/contacts/ContactFormModal";
import DeleteContactDialog from "@/components/contacts/DeleteContactDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactsState } from "@/hooks/useContactsState";
import ContactFilters from "@/components/contacts/ContactFilters";
import ContactsContent from "@/components/contacts/ContactsContent";

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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Контакты"
        description="Управление контактами клиентов"
        action={
          <Button onClick={handleAddContact} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Добавить контакт
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список контактов</CardTitle>
            <CardDescription>
              Управление информацией о клиентах и их контактных данных
            </CardDescription>
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
        </CardHeader>
        <CardContent>
          <ContactsContent
            contacts={contacts}
            loading={loading}
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            handleSort={handleSort}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />
        </CardContent>
      </Card>
      
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
