import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { Database } from "@/integrations/supabase/types";

// Define a type for the raw data returned from Supabase
type OrderRawData = Database['public']['Tables']['orders']['Row'] & {
  contacts?: { full_name: string } | null;
  profiles?: { full_name: string } | null;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      contacts:client_contact_id(contact_id, full_name),
      profiles:assigned_user_id(id, full_name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Transform data to match our Order type, safely handling potential null values
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
    attached_files_order_docs: 
      (Array.isArray(order.attached_files_order_docs) ? 
        order.attached_files_order_docs : []),
    closing_date: order.closing_date,
    creator_user_id: order.creator_user_id || "",
    client_language: order.client_language as "ES" | "EN" | "RU",
    // Add nested relation objects
    contact: order.contacts ? {
      contact_id: order.contacts.contact_id,
      full_name: order.contacts.full_name
    } : null,
    // Ensure creator exists (with defaults)
    creator: {
      id: order.creator_user_id || "",
      full_name: "Unknown" // Default value
    },
    assigned_user: order.profiles ? {
      id: order.profiles.id,
      full_name: order.profiles.full_name
    } : null,
    // Default values for other required fields
    company: null,
    partner_manufacturer: null,
    source_lead: null
  }));

  return transformedOrders;
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders
  });
};

// Keeping the fetchOrderById function but note that it's also defined in useOrderById.ts
export const fetchOrderById = async (id: number): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      contacts:client_contact_id(contact_id, full_name),
      companies:client_company_id(company_id, company_name),
      leads:source_lead_id(lead_id, name),
      profiles:assigned_user_id(id, full_name),
      partners:partner_manufacturer_id(partner_manufacturer_id, company_name)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  // Cast the data to any to safely access properties without TypeScript errors
  const orderData: any = data;
  
  const transformedOrder: Order = {
    id: orderData.id,
    created_at: orderData.created_at,
    order_number: orderData.order_number,
    order_name: orderData.order_name,
    order_type: orderData.order_type as "Готовая мебель (Tilda)" | "Мебель на заказ",
    status: orderData.status,
    client_contact_id: orderData.client_contact_id,
    client_company_id: orderData.client_company_id,
    source_lead_id: orderData.source_lead_id,
    assigned_user_id: orderData.assigned_user_id,
    partner_manufacturer_id: orderData.partner_manufacturer_id,
    final_amount: orderData.final_amount,
    payment_status: orderData.payment_status,
    partial_payment_amount: orderData.partial_payment_amount,
    delivery_address_full: orderData.delivery_address_full,
    notes_history: orderData.notes_history,
    attached_files_order_docs: Array.isArray(orderData.attached_files_order_docs) ? 
      orderData.attached_files_order_docs : [],
    closing_date: orderData.closing_date,
    creator_user_id: orderData.creator_user_id || "",
    client_language: orderData.client_language as "ES" | "EN" | "RU",
    // Add relation objects
    contact: orderData.contacts ? {
      contact_id: orderData.contacts.contact_id,
      full_name: orderData.contacts.full_name
    } : null,
    company: orderData.companies ? {
      company_id: orderData.companies.company_id,
      company_name: orderData.companies.company_name
    } : null,
    creator: {
      id: orderData.creator_user_id || "",
      full_name: "Unknown"
    },
    assigned_user: orderData.profiles ? {
      id: orderData.profiles.id,
      full_name: orderData.profiles.full_name
    } : null,
    partner_manufacturer: orderData.partners ? {
      partner_manufacturer_id: orderData.partners.partner_manufacturer_id,
      company_name: orderData.partners.company_name  
    } : null,
    source_lead: orderData.leads ? {
      lead_id: orderData.leads.lead_id
    } : null
  };
  
  return transformedOrder;
};

export const useOrderById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id!),
    enabled: !!id
  });
};
