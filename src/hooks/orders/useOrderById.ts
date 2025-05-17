
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export const fetchOrderById = async (id: number): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      contact:client_contact_id(contact_id, full_name, primary_phone, primary_email),
      company:client_company_id(company_id, company_name),
      creator_profile:creator_user_id(id, full_name),
      assigned_profile:assigned_user_id(id, full_name),
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
    // Map creator from creator_profile
    creator: {
      id: data.creator_user_id || "",
      full_name: data.creator_profile?.full_name || ""
    },
    // Map assigned_user from assigned_profile
    assigned_user: data.assigned_profile ? {
      id: data.assigned_profile.id || "",
      full_name: data.assigned_profile.full_name || ""
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
