
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
      creator:creator_user_id(id, full_name),
      assigned_user:assigned_user_id(id, full_name),
      partner_manufacturer:partner_manufacturer_id(partner_manufacturer_id, company_name),
      source_lead:source_lead_id(lead_id)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Order;
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
