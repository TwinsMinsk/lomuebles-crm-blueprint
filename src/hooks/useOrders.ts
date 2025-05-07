
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
}

export function useOrders() {
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchOrders = async ({ page, pageSize, sortColumn, sortDirection }: OrdersQueryParams) => {
    // Calculate offset for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query to fetch orders with related data
    const { data: orders, error, count } = await supabase
      .from("deals_orders")
      .select(`
        *,
        contacts:associated_contact_id (full_name),
        companies:associated_company_id (company_name),
        profiles:assigned_user_id (full_name)
      `, { count: 'exact' })
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

  // Format currency
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return "Не указано";
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(amount);
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
    formatCurrency,
    formatDate
  };
}
