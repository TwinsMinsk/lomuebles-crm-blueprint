
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

interface UseContactDeleteProps {
  onDeleteSuccess: () => void;
}

export function useContactDelete({ onDeleteSuccess }: UseContactDeleteProps) {
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<ContactWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
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
      onDeleteSuccess(); // Callback to refresh contacts list
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
  
  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  return {
    isDeleteDialogOpen,
    contactToDelete,
    isDeleting,
    handleDeleteContact,
    handleConfirmDelete,
    handleCloseDeleteDialog
  };
}
