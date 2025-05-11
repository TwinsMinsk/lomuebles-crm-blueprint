
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types/order";

export const updateOrder = async ({ orderId, orderData }: { orderId: number, orderData: Partial<Order> }) => {
  const { data, error } = await supabase
    .from('orders')
    .update(orderData)
    .eq('id', orderId)
    .select();
  
  if (error) throw error;
  return data;
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Заказ успешно обновлен!');
    },
    onError: (err: any) => {
      toast.error(`Ошибка обновления заказа: ${err.message}`);
    }
  });

  return {
    updateOrder: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
