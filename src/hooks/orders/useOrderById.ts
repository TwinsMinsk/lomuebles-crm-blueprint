
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export const fetchOrderById = async (id: number): Promise<Order> => {
  // Make column references completely explicit to avoid ambiguity
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      contact:client_contact_id(contact_id, full_name, primary_phone, primary_email),
      company:client_company_id(company_id, company_name),
      creator:profiles!creator_user_id(id, full_name),
      assignee:profiles!assigned_user_id(id, full_name),
      partner_manufacturer:partner_manufacturer_id(partner_manufacturer_id, company_name),
      source_lead:source_lead_id(lead_id)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  
  // Transform data to match our Order type, ensuring the specific enum values are correctly typed
  // and JSON data is properly handled
  const transformedOrder: Order = {
    ...data,
    order_type: data.order_type as "Готовая мебель (Tilda)" | "Мебель на заказ",
    client_language: data.client_language as "ES" | "EN" | "RU",
    // Ensure attached_files_order_docs is always an array
    attached_files_order_docs: data.attached_files_order_docs ? 
      (Array.isArray(data.attached_files_order_docs) ? 
        data.attached_files_order_docs : 
        typeof data.attached_files_order_docs === 'string' ? 
          JSON.parse(data.attached_files_order_docs) : 
          [])
      : [],
    // Define creator object correctly
    creator: {
      id: data.creator_user_id || "",
      full_name: data.creator?.full_name || ""
    },
    // Define assigned user object correctly with null check
    assigned_user: data.assigned_user_id ? {
      id: data.assigned_user_id,
      full_name: data.assignee?.full_name || ""
    } : null,
    // Ensure other relational objects are properly defined
    contact: data.contact || null,
    company: data.company || null,
    partner_manufacturer: data.partner_manufacturer || null,
    source_lead: data.source_lead || null
  };

  return transformedOrder;
};

export const useOrderById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => {
      if (!id) throw new Error("Order ID is required");
      return fetchOrderById(id);
    },
    enabled: !!id,
  });
};
