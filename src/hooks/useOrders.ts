
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrdersQueryParams } from "@/types/order";
import { toast } from "sonner";

export function useOrders() {
  const [totalCount, setTotalCount] = useState(0);
  
  const fetchOrders = async ({
    page = 1,
    pageSize = 10,
    sortColumn = 'created_at',
    sortDirection = 'desc',
    filters = {}
  }: OrdersQueryParams): Promise<Order[]> => {
    try {
      const { 
        search, 
        orderType, 
        status, 
        clientLanguage, 
        dateFrom, 
        dateTo, 
        assignedToMe, 
        createdByMe, 
        assignedUserId 
      } = filters;
      
      // Start building the query
      let query = supabase
        .from('orders')
        .select(`
          *,
          contacts(full_name),
          companies(company_name),
          profiles!orders_assigned_user_id_fkey(full_name)
        `, { count: 'exact' });
      
      // Apply search filter
      if (search) {
        query = query.or(`order_name.ilike.%${search}%,order_number.ilike.%${search}%`);
      }
      
      // Apply order type filter
      if (orderType) {
        query = query.eq('order_type', orderType);
      }
      
      // Apply status filter
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply client language filter
      if (clientLanguage) {
        query = query.eq('client_language', clientLanguage);
      }
      
      // Apply date range filter
      if (dateFrom && dateTo) {
        query = query.gte('created_at', dateFrom.toISOString()).lte('created_at', dateTo.toISOString());
      } else if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      } else if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }
      
      // Apply user filters
      const { data: { user } } = await supabase.auth.getUser();
      if (assignedUserId) {
        query = query.eq('assigned_user_id', assignedUserId);
      } 
      // Only apply these filters if no specific assignedUserId is set
      else if (user) {
        if (assignedToMe && createdByMe) {
          query = query.or(`assigned_user_id.eq.${user.id},creator_user_id.eq.${user.id}`);
        } else if (assignedToMe) {
          query = query.eq('assigned_user_id', user.id);
        } else if (createdByMe) {
          query = query.eq('creator_user_id', user.id);
        }
      }
      
      // Add sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Ошибка загрузки заказов");
        throw error;
      }
      
      // Store the total count
      if (count !== null) {
        setTotalCount(count);
      }
      
      // Process the data to include related entity names
      const processedOrders: Order[] = (data || []).map(order => {
        return {
          ...order,
          contact_name: order.contacts?.full_name || null,
          company_name: order.companies?.company_name || null,
          assigned_user_name: order.profiles?.full_name || null
        };
      });
      
      return processedOrders;
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      throw error;
    }
  };

  const useOrdersQuery = (params: OrdersQueryParams) => {
    return useQuery({
      queryKey: ['orders', params],
      queryFn: () => fetchOrders(params),
      keepPreviousData: true,
    });
  };

  return { fetchOrders, useOrdersQuery, totalCount };
}
