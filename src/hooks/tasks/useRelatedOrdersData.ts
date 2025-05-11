
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

/**
 * Hook to fetch orders data for related entities selection
 * Used in tasks and other forms that need to reference orders
 */
export const useRelatedOrdersData = (searchTerm: string = "", limit: number = 20) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Base query to orders table
        let query = supabase
          .from('orders')
          .select(`
            *,
            contacts:client_contact_id(contact_id, full_name),
            profiles:assigned_user_id(id, full_name)
          `)
          .limit(limit);

        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(
            `order_number.ilike.%${searchTerm}%,order_name.ilike.%${searchTerm}%`
          );
        }

        // Execute the query
        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Transform data to match our Order type, with safe access to potentially null relation data
        const transformedOrders = (data || []).map((order: any) => ({
          id: order.id,
          created_at: order.created_at,
          order_number: order.order_number,
          order_name: order.order_name,
          order_type: order.order_type as "Готовая мебель (Tilda)" | "Мебель на заказ",
          status: order.status,
          client_contact_id: order.client_contact_id,
          client_company_id: order.client_company_id,
          source_lead_id: order.source_lead_id,
          assigned_user_id: order.assigned_user_id,
          partner_manufacturer_id: order.partner_manufacturer_id,
          final_amount: order.final_amount,
          payment_status: order.payment_status,
          delivery_address_full: order.delivery_address_full,
          notes_history: order.notes_history,
          attached_files_order_docs: order.attached_files_order_docs as any[] | null,
          closing_date: order.closing_date,
          creator_user_id: order.creator_user_id,
          client_language: order.client_language as "ES" | "EN" | "RU",
          contact_name: order.contacts?.full_name || undefined,
          assigned_user_name: order.profiles?.full_name || undefined
        }));

        setOrders(transformedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [searchTerm, limit]);

  return { orders, isLoading, error };
};
