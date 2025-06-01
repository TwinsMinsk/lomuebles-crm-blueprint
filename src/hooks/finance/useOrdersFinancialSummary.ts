
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
    console.log('fetchOrdersFinancialSummary: Starting with filters:', filters);

    // First, get all orders that have transactions within the date range
    let transactionQuery = supabase
      .from("transactions")
      .select("related_order_id")
      .not("related_order_id", "is", null);

    // Apply date filters to transactions
    if (filters?.dateFrom) {
      transactionQuery = transactionQuery.gte('transaction_date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      transactionQuery = transactionQuery.lte('transaction_date', filters.dateTo);
    }

    const { data: transactionOrderIds, error: transactionError } = await transactionQuery;

    if (transactionError) {
      console.error('Error fetching transaction order IDs:', transactionError);
      throw transactionError;
    }

    console.log('fetchOrdersFinancialSummary: Transaction order IDs:', transactionOrderIds);

    // Get unique order IDs that have transactions in the date range
    const orderIdsWithTransactions = [...new Set(transactionOrderIds?.map(t => t.related_order_id).filter(Boolean))];
    
    if (orderIdsWithTransactions.length === 0) {
      console.log('fetchOrdersFinancialSummary: No orders found with transactions in date range');
      return [];
    }

    // Now get the order details for these orders
    let orderQuery = supabase
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
      .in('id', orderIdsWithTransactions)
      .order('created_at', { ascending: false });

    // Apply additional filters to orders
    if (filters?.orderType && filters.orderType !== 'all') {
      orderQuery = orderQuery.eq('order_type', filters.orderType);
    }
    if (filters?.orderStatus && filters.orderStatus !== 'all') {
      orderQuery = orderQuery.eq('status', filters.orderStatus);
    }

    const { data: ordersData, error: ordersError } = await orderQuery;

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }
    if (!ordersData || ordersData.length === 0) {
      console.log('fetchOrdersFinancialSummary: No orders found after applying filters');
      return [];
    }

    console.log('fetchOrdersFinancialSummary: Found orders:', ordersData.length);

    // Get financial data for each order, but only for transactions within the date range
    const ordersWithFinancials: OrderFinancialData[] = [];

    for (const order of ordersData) {
      // Build transaction query for this specific order with date range
      let incomeQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .eq("related_order_id", order.id);

      let expenseQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .eq("related_order_id", order.id);

      // Apply date filters to both queries
      if (filters?.dateFrom) {
        incomeQuery = incomeQuery.gte('transaction_date', filters.dateFrom);
        expenseQuery = expenseQuery.gte('transaction_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        incomeQuery = incomeQuery.lte('transaction_date', filters.dateTo);
        expenseQuery = expenseQuery.lte('transaction_date', filters.dateTo);
      }

      // Execute both queries
      const [{ data: incomeData, error: incomeError }, { data: expenseData, error: expenseError }] = await Promise.all([
        incomeQuery,
        expenseQuery
      ]);

      if (incomeError) {
        console.error(`Error fetching income for order ${order.id}:`, incomeError);
      }
      if (expenseError) {
        console.error(`Error fetching expenses for order ${order.id}:`, expenseError);
      }

      // Calculate totals for transactions within the date range
      const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const profit = totalIncome - totalExpenses;

      console.log(`fetchOrdersFinancialSummary: Order ${order.order_number} - Income: ${totalIncome}, Expenses: ${totalExpenses}, Profit: ${profit}`);

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

    console.log('fetchOrdersFinancialSummary: Final result:', ordersWithFinancials.length, 'orders');
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
