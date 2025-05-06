
import { useState } from "react";
import { Company } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useCompanyDelete() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  
  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async (onSuccess: () => void) => {
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
      onSuccess();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Ошибка при удалении",
        description: "Не удалось удалить компанию. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };

  return {
    isDeleteDialogOpen,
    companyToDelete,
    handleDeleteCompany,
    handleConfirmDelete,
    handleCloseDeleteDialog
  };
}
