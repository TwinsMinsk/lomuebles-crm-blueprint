
import { useState, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";

/**
 * Custom hook to fetch and manage orders data for task related entities
 */
export function useRelatedOrdersData() {
  const [orders, setOrders] = useState<any[]>([]);
  const { fetchOrders } = useOrders();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders({
          page: 1,
          pageSize: 100,
          sortColumn: 'creation_date',
          sortDirection: 'desc',
          filters: {}
        });
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      }
    };
    
    loadOrders();
  }, [fetchOrders]);

  return { orders };
}
