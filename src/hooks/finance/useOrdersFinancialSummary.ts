
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderFinancialData {
  order_id: number;
  order_number: string;
  order_name: string | null;
  order_type: string;
  status: string;
  client_name: string | null;
  created_at: string;
  closing_date: string | null;
  total_income: number;
  total_expenses: number;
  profit: number;
}

export interface OrdersFinancialFilters {
  dateFrom?: string;
  dateTo?: string;
  orderType?: string;
  orderStatus?: string;
}

export const fetchOrdersFinancialSummary = async (filters?: OrdersFinancialFilters): Promise<OrderFinancialData[]> => {
  try {
    // Base query to get orders with their financial data
    let query = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        order_name,
        order_type,
        status,
        created_at,
        closing_date,
        contacts!client_contact_id(full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo + 'T23:59:59.999Z');
    }
    if (filters?.orderType && filters.orderType !== 'all') {
      query = query.eq('order_type', filters.orderType);
    }
    if (filters?.orderStatus && filters.orderStatus !== 'all') {
      query = query.eq('status', filters.orderStatus);
    }

    const { data: ordersData, error: ordersError } = await query;

    if (ordersError) throw ordersError;
    if (!ordersData || ordersData.length === 0) return [];

    // Get financial data for each order
    const ordersWithFinancials: OrderFinancialData[] = [];

    for (const order of ordersData) {
      // Get income transactions for this order
      const { data: incomeData, error: incomeError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .eq("related_order_id", order.id);

      if (incomeError) {
        console.error(`Error fetching income for order ${order.id}:`, incomeError);
      }

      // Get expense transactions for this order
      const { data: expenseData, error: expenseError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .eq("related_order_id", order.id);

      if (expenseError) {
        console.error(`Error fetching expenses for order ${order.id}:`, expenseError);
      }

      // Calculate totals
      const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const profit = totalIncome - totalExpenses;

      ordersWithFinancials.push({
        order_id: order.id,
        order_number: order.order_number,
        order_name: order.order_name,
        order_type: order.order_type,
        status: order.status,
        client_name: (order.contacts as any)?.full_name || null,
        created_at: order.created_at,
        closing_date: order.closing_date,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        profit: profit
      });
    }

    return ordersWithFinancials;
  } catch (error) {
    console.error("Error fetching orders financial summary:", error);
    return [];
  }
};

export const useOrdersFinancialSummary = (filters?: OrdersFinancialFilters) => {
  return useQuery({
    queryKey: ['orders_financial_summary', filters],
    queryFn: () => fetchOrdersFinancialSummary(filters),
  });
};
