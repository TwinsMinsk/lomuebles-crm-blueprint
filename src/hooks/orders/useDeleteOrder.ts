
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteOrder() {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      setIsDeleting(true);
      try {
        // First delete all order items related to this order
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('parent_deal_order_id', orderId);

        if (itemsError) {
          throw new Error(`Ошибка при удалении позиций заказа: ${itemsError.message}`);
        }

        // Then delete the order itself
        const { error: orderError } = await supabase
          .from('deals_orders')
          .delete()
          .eq('deal_order_id', orderId);

        if (orderError) {
          throw new Error(`Ошибка при удалении заказа: ${orderError.message}`);
        }

        return orderId;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Заказ успешно удален");
    },
    onError: (error: Error) => {
      toast.error("Ошибка при удалении заказа", {
        description: error.message
      });
      console.error("Error deleting order:", error);
    }
  });

  const deleteOrder = async (orderId: number) => {
    return deleteOrderMutation.mutateAsync(orderId);
  };

  return { deleteOrder, isDeleting };
}
