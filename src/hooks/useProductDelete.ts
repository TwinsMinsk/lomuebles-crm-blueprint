
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProductDelete = (onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);

  const deleteProduct = async (productId: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) throw error;

      toast.success("Товар успешно удален!");
      onSuccess();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Ошибка при удалении товара");
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProduct,
    loading,
  };
};
