
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteOrder = async (orderId: number) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  
  if (error) throw error;
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Заказ успешно удален!');
    },
    onError: (err: any) => {
      toast.error(`Ошибка удаления заказа: ${err.message}`);
    }
  });
};
