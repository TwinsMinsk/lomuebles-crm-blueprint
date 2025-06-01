
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
          assigned_user_id
        `)
        .order('creation_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get user names for assigned users
      const userIds = [...new Set((data || []).map(lead => lead.assigned_user_id).filter(Boolean))];
      
      let userNames: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        if (profiles) {
          userNames = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile.full_name || 'Не указано';
            return acc;
          }, {} as Record<string, string>);
        }
      }

      return (data || []).map(lead => ({
        ...lead,
        assignedUser: lead.assigned_user_id ? { full_name: userNames[lead.assigned_user_id] || 'Не назначен' } : null
      }));
    },
    enabled: isAdmin,
  });
};

export const useRecentOrders = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

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
          client_contact_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get contact names
      const contactIds = [...new Set((data || []).map(order => order.client_contact_id).filter(Boolean))];
      
      let contactNames: Record<number, string> = {};
      if (contactIds.length > 0) {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('contact_id, full_name')
          .in('contact_id', contactIds);
        
        if (contacts) {
          contactNames = contacts.reduce((acc, contact) => {
            acc[contact.contact_id] = contact.full_name || 'Не указано';
            return acc;
          }, {} as Record<number, string>);
        }
      }

      return (data || []).map(order => ({
        ...order,
        contacts: order.client_contact_id ? { full_name: contactNames[order.client_contact_id] || 'Контакт не указан' } : null
      }));
    },
    enabled: isAdmin,
  });
};
