
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useRecentLeads = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

  return useQuery({
    queryKey: ['recent-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          lead_id,
          name,
          email,
          phone,
          creation_date,
          assignedUser:assigned_manager_user_id(full_name)
        `)
        .order('creation_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });
};

export const useRecentOrders = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Główny Administrador' || userRole === 'Administrador';

  return useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_type,
          status,
          created_at,
          contacts:client_contact_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });
};
