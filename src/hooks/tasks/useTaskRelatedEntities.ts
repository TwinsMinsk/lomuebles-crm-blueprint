
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useTaskRelatedEntities = () => {
  const { user } = useAuth();

  // Fetch users for assignee selection
  const { 
    data: users = [],
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: ["task-form", "users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      return data.map(user => ({
        id: user.id,
        full_name: user.full_name
      }));
    },
    enabled: !!user
  });

  // Fetch leads
  const { 
    data: leads = [],
    isLoading: isLoadingLeads 
  } = useQuery({
    queryKey: ["task-form", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("lead_id, name, phone")
        .order("creation_date", { ascending: false });

      if (error) throw error;
      return data.map(lead => ({
        id: lead.lead_id,
        name: lead.name || "Лид без имени",
        label: `${lead.name || "Лид без имени"} ${lead.phone ? `(${lead.phone})` : ""}`
      }));
    },
    enabled: !!user
  });

  // Fetch contacts
  const { 
    data: contacts = [],
    isLoading: isLoadingContacts 
  } = useQuery({
    queryKey: ["task-form", "contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("contact_id, full_name, primary_phone")
        .order("full_name");

      if (error) throw error;
      return data.map(contact => ({
        id: contact.contact_id,
        name: contact.full_name,
        label: `${contact.full_name} ${contact.primary_phone ? `(${contact.primary_phone})` : ""}`
      }));
    },
    enabled: !!user
  });

  // Fetch orders (updated to use orders table instead of deals_orders)
  const { 
    data: orders = [],
    isLoading: isLoadingOrders 
  } = useQuery({
    queryKey: ["task-form", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, order_name")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(order => ({
        id: order.id,
        name: order.order_name || order.order_number,
        label: `${order.order_number} - ${order.order_name || "Без названия"}`
      }));
    },
    enabled: !!user
  });

  // Fetch partners
  const { 
    data: partners = [],
    isLoading: isLoadingPartners 
  } = useQuery({
    queryKey: ["task-form", "partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_manufacturers")
        .select("partner_manufacturer_id, company_name")
        .order("company_name");

      if (error) throw error;
      return data.map(partner => ({
        id: partner.partner_manufacturer_id,
        name: partner.company_name,
        label: partner.company_name
      }));
    },
    enabled: !!user
  });

  // Fetch custom requests
  const { 
    data: customRequests = [],
    isLoading: isLoadingCustomRequests 
  } = useQuery({
    queryKey: ["task-form", "custom-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_requests")
        .select("custom_request_id, request_name")
        .order("creation_date", { ascending: false });

      if (error) throw error;
      return data.map(request => ({
        id: request.custom_request_id,
        name: request.request_name || `Запрос #${request.custom_request_id}`,
        label: request.request_name || `Запрос #${request.custom_request_id}`
      }));
    },
    enabled: !!user
  });

  return {
    users,
    leads,
    contacts,
    orders,
    partners,
    customRequests,
    isLoading: 
      isLoadingUsers || 
      isLoadingLeads || 
      isLoadingContacts || 
      isLoadingOrders || 
      isLoadingPartners || 
      isLoadingCustomRequests
  };
};
