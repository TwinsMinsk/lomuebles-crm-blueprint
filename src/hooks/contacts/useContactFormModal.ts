
import { useState } from "react";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

export function useContactFormModal() {
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [contactToEdit, setContactToEdit] = useState<ContactWithRelations | undefined>(undefined);
  
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
  
  // Handle close modal
  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setContactToEdit(undefined);
  };

  return {
    isFormModalOpen,
    contactToEdit,
    handleAddContact,
    handleEditContact,
    handleModalClose
  };
}
