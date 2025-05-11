
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types/order";

export const addOrder = async (orderData: Partial<Order> & { client_contact_id: number, client_language: string, order_type: string, status: string }) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select();
  
  if (error) throw error;
  return data;
};

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: addOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Заказ успешно создан!');
    },
    onError: (err: any) => {
      toast.error(`Ошибка создания заказа: ${err.message}`);
    }
  });

  return {
    addOrder: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
