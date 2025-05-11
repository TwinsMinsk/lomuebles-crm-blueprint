
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

/**
 * Custom hook to fetch and manage orders data for task related entities
 */
export function useRelatedOrdersData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        
        // Fetch orders directly from Supabase
        const { data: fetchedOrders, error } = await supabase
          .from('orders')
          .select('*, contacts(full_name), companies(company_name)')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        
        // Map the data to match the Order type
        const processedData = (fetchedOrders || []).map(order => ({
          id: order.id,
          created_at: order.created_at,
          order_number: order.order_number,
          order_name: order.order_name || null,
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
          attached_files_order_docs: order.attached_files_order_docs,
          closing_date: order.closing_date,
          creator_user_id: order.creator_user_id,
          client_language: order.client_language as "ES" | "EN" | "RU",
          contact_name: order.contacts?.full_name || null,
          company_name: order.companies?.company_name || null,
        }));
        
        setOrders(processedData);
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
