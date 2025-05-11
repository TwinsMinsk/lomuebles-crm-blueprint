
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFilterOptions = () => {
  // Fetch order types
  const orderTypesQuery = useQuery({
    queryKey: ['orderTypeOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_distinct_values', { table_name: 'orders', column_name: 'order_type' });
      
      if (error) throw error;
      return data as string[] || ["Готовая мебель (Tilda)", "Мебель на заказ"];
    }
  });

  // Fetch status options
  const statusesQuery = useQuery({
    queryKey: ['orderStatusOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_distinct_values', { table_name: 'orders', column_name: 'status' });
      
      if (error) throw error;
      return data as string[] || [];
    }
  });

  return {
    orderTypes: orderTypesQuery.data || ["Готовая мебель (Tilda)", "Мебель на заказ"],
    statuses: statusesQuery.data || [],
    isLoading: orderTypesQuery.isLoading || statusesQuery.isLoading,
    error: orderTypesQuery.error || statusesQuery.error
  };
};
