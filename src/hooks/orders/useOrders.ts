
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { toast } from "sonner";

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, contacts(full_name), companies(company_name), profiles!orders_assigned_user_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process the data to match the Order type
    const processedData: Order[] = (data || []).map(order => ({
      id: order.id,
      created_at: order.created_at,
      order_number: order.order_number,
      order_name: order.order_name,
      order_type: order.order_type,
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
      client_language: order.client_language,
      contact_name: order.contacts?.full_name || null,
      company_name: order.companies?.company_name || null,
      assigned_user_name: order.profiles?.full_name || null
    }));
    
    return processedData;
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    toast.error(`Ошибка загрузки заказов: ${error.message}`);
    throw error;
  }
};

export const fetchOrderById = async (id: number): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, contacts(*), companies(*), leads(*), profiles!orders_assigned_user_id_fkey(*), partners_manufacturers(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const order: Order = {
      id: data.id,
      created_at: data.created_at,
      order_number: data.order_number,
      order_name: data.order_name,
      order_type: data.order_type,
      status: data.status,
      client_contact_id: data.client_contact_id,
      client_company_id: data.client_company_id,
      source_lead_id: data.source_lead_id,
      assigned_user_id: data.assigned_user_id,
      partner_manufacturer_id: data.partner_manufacturer_id,
      final_amount: data.final_amount,
      payment_status: data.payment_status,
      delivery_address_full: data.delivery_address_full,
      notes_history: data.notes_history,
      attached_files_order_docs: data.attached_files_order_docs,
      closing_date: data.closing_date,
      creator_user_id: data.creator_user_id,
      client_language: data.client_language,
      contact_name: data.contacts?.full_name || null,
      company_name: data.companies?.company_name || null,
      assigned_user_name: data.profiles?.full_name || null
    };
    
    return order;
  } catch (error: any) {
    console.error("Error fetching order by ID:", error);
    toast.error(`Ошибка загрузки заказа: ${error.message}`);
    throw error;
  }
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders
  });
};

export const useOrderById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id!),
    enabled: !!id
  });
};
