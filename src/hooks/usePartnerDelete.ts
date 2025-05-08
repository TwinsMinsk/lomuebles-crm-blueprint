
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePartnerDelete = (onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);

  const deletePartner = async (partnerId: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("partners_manufacturers")
        .delete()
        .eq("partner_manufacturer_id", partnerId);

      if (error) throw error;

      toast.success("Партнер-изготовитель успешно удален!");
      onSuccess();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("Ошибка при удалении партнера-изготовителя");
    } finally {
      setLoading(false);
    }
  };

  return {
    deletePartner,
    loading,
  };
};
