
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ContactWithRelations } from "@/components/contacts/ContactTableRow";

export function useContactDelete({ onDeleteSuccess }: { onDeleteSuccess: () => void }) {
  const queryClient = useQueryClient();
  
  // State for tracking delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactWithRelations | null>(null);
  
  // Check if contact has associated orders
  const checkAssociatedOrders = async (contactId: number) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("client_contact_id", contactId)
      .limit(1);
    
    if (error) {
      console.error("Error checking associated orders:", error);
      throw new Error("Ошибка при проверке связанных заказов");
    }
    
    return { hasOrders: data && data.length > 0, orderCount: data?.length || 0 };
  };
  
  // Delete mutation
  const { mutate: deleteContact, isPending: isDeleting } = useMutation({
    mutationFn: async (contactId: number) => {
      // First check if this contact has associated orders
      const { hasOrders, orderCount } = await checkAssociatedOrders(contactId);
      
      if (hasOrders) {
        throw new Error(`Контакт не может быть удален, так как с ним связано ${orderCount} заказ(ов). Сначала удалите или измените эти заказы.`);
      }
      
      // If no associated orders, proceed with deletion
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("contact_id", contactId);
        
      if (error) {
        console.error("Error deleting contact:", error);
        throw new Error(error.message || "Ошибка при удалении контакта");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      
      toast({
        title: "Контакт удален",
        description: "Контакт успешно удален из системы"
      });
      
      // Call the callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      // Reset state
      setContactToDelete(null);
    },
    onError: (error: Error) => {
      console.error("Contact deletion error:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка при удалении контакта",
        description: error.message || "Произошла неизвестная ошибка"
      });
    }
  });
  
  // Dialog handlers
  const handleDeleteContact = (contact: ContactWithRelations) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = (contactId: number) => {
    deleteContact(contactId);
    setIsDeleteDialogOpen(false);
  };
  
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
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
