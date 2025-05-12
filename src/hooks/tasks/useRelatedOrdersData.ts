
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { useAuth } from "@/context/AuthContext";

/**
 * Hook to fetch orders data for related entities selection
 * Used in tasks and other forms that need to reference orders
 * Implements role-based filtering:
 * - Admin users see all orders
 * - Other users see only orders where they are assigned or creator
 */
export const useRelatedOrdersData = (searchTerm: string = "", limit: number = 100) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, userRole } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return; // Don't fetch if no user

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching orders with filters:", { 
          userId: user?.id, 
          userRole, 
          searchTerm, 
          limit 
        });
        
        // Base query to orders table instead of deals_orders
        let query = supabase
          .from('orders')
          .select(`
            *,
            contacts:client_contact_id(contact_id, full_name),
            profiles:assigned_user_id(id, full_name)
          `);

        console.log("Initial query built for table 'orders'");

        // Apply role-based filtering
        // Admins see all orders, other users see only their own
        if (userRole !== 'Главный Администратор' && userRole !== 'Администратор') {
          query = query.or(`assigned_user_id.eq.${user.id},creator_user_id.eq.${user.id}`);
          console.log(`Applied role-based filtering for non-admin user: ${user.id}`);
        } else {
          console.log(`No filtering applied for admin user role: ${userRole}`);
        }

        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(
            `order_number.ilike.%${searchTerm}%,order_name.ilike.%${searchTerm}%`
          );
          console.log(`Applied search filter: ${searchTerm}`);
        }

        // Apply limit and order by creation date
        query = query.order('created_at', { ascending: false }).limit(limit);

        // Execute the query
        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error in Supabase query:", fetchError);
          throw fetchError;
        }

        console.log("Raw orders data from Supabase:", data);
        console.log("Orders fetched count:", data?.length || 0);

        if (!data || data.length === 0) {
          console.log("No orders returned from the database");
        }

        // Transform data to match our Order type, with safe access to potentially null relation data
        const transformedOrders = (data || []).map((order: any) => ({
          id: order.id,
          created_at: order.created_at,
          order_number: order.order_number,
          order_name: order.order_name,
          order_type: order.order_type,
          status: order.status || "Неизвестный статус",
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
          contact_name: order.contacts?.full_name || undefined,
          assigned_user_name: order.profiles?.full_name || undefined
        }));

        console.log("Transformed orders:", transformedOrders.length);
        setOrders(transformedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [searchTerm, limit, user, userRole]);

  return { orders, isLoading, error };
};
