
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook to fetch and manage orders data for task related entities
 */
export function useRelatedOrdersData() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        
        // Fetch orders directly from Supabase instead of using the useOrders hook
        const { data: fetchedOrders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  return { orders, isLoading };
}
