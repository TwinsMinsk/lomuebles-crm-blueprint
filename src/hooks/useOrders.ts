
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { OrderFilters } from "./orders/useOrdersState";
import { formatCurrency, formatDate as formatDateUtil } from "@/utils/formatters";

export interface Order {
  deal_order_id: number;
  order_number: string;
  order_name: string | null;
  order_type: string;
  associated_contact_id: number;
  associated_company_id: number | null;
  final_amount: number | null;
  status_ready_made: string | null;
  status_custom_made: string | null;
  assigned_user_id: string | null;
  creation_date: string;
  payment_status: string | null;
  // Related data from joins
  contact_name: string | null;
  company_name: string | null;
  manager_name: string | null;
  current_status: string | null;
}

export interface OrdersQueryParams {
  page: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  filters?: OrderFilters;
}

export function useOrders() {
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchOrders = async ({ page, pageSize, sortColumn, sortDirection, filters }: OrdersQueryParams) => {
    // Calculate offset for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from("deals_orders")
      .select(`
        *,
        contacts:associated_contact_id (full_name),
        companies:associated_company_id (company_name),
        profiles:assigned_user_id (full_name)
      `, { count: 'exact' });

    // Apply filters if any
    if (filters) {
      // Search filter
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`order_number.ilike.${searchTerm},order_name.ilike.${searchTerm}`);
      }

      // Order type filter
      if (filters.orderType) {
        query = query.eq('order_type', filters.orderType);
      }

      // Current status filter - depends on order type
      if (filters.currentStatus) {
        if (filters.orderType === "Готовая мебель (Tilda)") {
          query = query.eq('status_ready_made', filters.currentStatus);
        } else if (filters.orderType === "Мебель на заказ") {
          query = query.eq('status_custom_made', filters.currentStatus);
        }
      }

      // Assigned user filter
      if (filters.assignedUserId) {
        query = query.eq('assigned_user_id', filters.assignedUserId);
      }

      // Payment status filter
      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      // Date range filter
      if (filters.fromDate) {
        // Convert to ISO string for database comparison
        query = query.gte('creation_date', filters.fromDate.toISOString());
      }
      if (filters.toDate) {
        // Add 1 day to include the end date fully
        const nextDay = new Date(filters.toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('creation_date', nextDay.toISOString());
      }
    }

    // Apply sorting and pagination
    const { data: orders, error, count } = await query
      .order(sortColumn, { ascending: sortDirection === "asc" })
      .range(from, to);

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    if (count !== null) {
      setTotalCount(count);
    }

    // Transform the data to match our Order interface
    return orders.map((order: any) => ({
      ...order,
      contact_name: order.contacts?.full_name || "Не указан",
      company_name: order.companies?.company_name || "Не указана",
      manager_name: order.profiles?.full_name || "Не назначен",
      current_status: order.order_type === "Готовая мебель (Tilda)" 
        ? order.status_ready_made 
        : order.status_custom_made
    }));
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return {
    fetchOrders,
    totalCount,
    formatDate
  };
}
