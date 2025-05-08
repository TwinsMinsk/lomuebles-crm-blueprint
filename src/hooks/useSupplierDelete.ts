
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSupplierDelete = (onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);

  const deleteSupplier = async (supplierId: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("supplier_id", supplierId);

      if (error) throw error;

      toast.success("Поставщик успешно удален!");
      onSuccess();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Ошибка при удалении поставщика");
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteSupplier,
    loading,
  };
};
