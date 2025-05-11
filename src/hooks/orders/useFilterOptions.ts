
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFilterOptions = () => {
  // Fetch order types
  const orderTypesQuery = useQuery({
    queryKey: ['orderTypeOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('order_type')
        .order('order_type')
        .eq('order_type', 'order_type') // This ensures we get unique values
        .limit(10);
      
      if (error) throw error;
      
      // Extract unique values
      const uniqueTypes = [...new Set(data.map(item => item.order_type))];
      return uniqueTypes as string[] || ["Готовая мебель (Tilda)", "Мебель на заказ"];
    }
  });

  // Fetch status options
  const statusesQuery = useQuery({
    queryKey: ['orderStatusOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .order('status')
        .limit(20);
      
      if (error) throw error;
      
      // Extract unique values
      const uniqueStatuses = [...new Set(data.map(item => item.status))];
      return uniqueStatuses as string[] || [];
    }
  });

  return {
    orderTypes: orderTypesQuery.data || ["Готовая мебель (Tilda)", "Мебель на заказ"],
    statuses: statusesQuery.data || [],
    isLoading: orderTypesQuery.isLoading || statusesQuery.isLoading,
    error: orderTypesQuery.error || statusesQuery.error
  };
};
