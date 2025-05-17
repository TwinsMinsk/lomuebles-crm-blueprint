
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export const useRelatedOrdersData = (assignedUserId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = supabase
        .from("orders")
        .select(`
          id, 
          order_number, 
          order_name,
          order_type,
          status,
          client_contact_id,
          client_company_id,
          source_lead_id,
          assigned_user_id,
          partner_manufacturer_id,
          final_amount,
          payment_status,
          partial_payment_amount,
          delivery_address_full,
          notes_history,
          attached_files_order_docs,
          closing_date,
          created_at,
          creator_user_id,
          client_language,
          contacts:client_contact_id(contact_id, full_name),
          profiles:assigned_user_id(id, full_name)
        `)
        .order("created_at", { ascending: false });

      if (assignedUserId) {
        query.eq("assigned_user_id", assignedUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      // Transform the data to match our Order type
      const transformedOrders: Order[] = (data || []).map((order: any) => ({
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
        partial_payment_amount: order.partial_payment_amount,
        delivery_address_full: order.delivery_address_full,
        notes_history: order.notes_history,
        attached_files_order_docs: order.attached_files_order_docs || [],
        closing_date: order.closing_date,
        creator_user_id: order.creator_user_id,
        client_language: order.client_language as "ES" | "EN" | "RU",
        // Map relational fields
        contact: order.contacts ? {
          contact_id: order.contacts.contact_id,
          full_name: order.contacts.full_name
        } : null,
        // Add required fields based on our type definition
        company: null, 
        creator: {
          id: order.creator_user_id || "",
          full_name: ""
        },
        assigned_user: order.profiles ? {
          id: order.profiles.id,
          full_name: order.profiles.full_name
        } : null,
        partner_manufacturer: null,
        source_lead: order.source_lead_id ? { lead_id: order.source_lead_id } : null,
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Error in fetchOrders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [assignedUserId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, refreshOrders: fetchOrders };
};
