
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getMadridDayBoundaries } from "@/utils/timezone";

export interface FinancialSummary {
  total_income: number;
  total_expense: number;
  profit: number;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  total_amount: number;
}

// Get financial summary for a date range (using Madrid timezone)
export const fetchFinancialSummary = async (dateFrom: string, dateTo: string): Promise<FinancialSummary> => {
  // Convert date strings to Madrid timezone boundaries
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  
  const startBoundaries = getMadridDayBoundaries(startDate);
  const endBoundaries = getMadridDayBoundaries(endDate);
  
  // Use the start of the first day and end of the last day
  const fromISO = startBoundaries.start.toISOString().split('T')[0];
  const toISO = endBoundaries.end.toISOString().split('T')[0];

  console.log('fetchFinancialSummary: Date range in Madrid timezone:', {
    original: { dateFrom, dateTo },
    madrid: { fromISO, toISO }
  });

  // Get income data
  const { data: incomeData, error: incomeError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "income")
    .gte("transaction_date", fromISO)
    .lte("transaction_date", toISO);

  if (incomeError) throw incomeError;

  // Get expense data
  const { data: expenseData, error: expenseError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "expense")
    .gte("transaction_date", fromISO)
    .lte("transaction_date", toISO);

  if (expenseError) throw expenseError;

  // Calculate totals
  const total_income = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const total_expense = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const profit = total_income - total_expense;

  console.log('fetchFinancialSummary: Results:', { total_income, total_expense, profit });

  return {
    total_income,
    total_expense,
    profit
  };
};

// Get category summary for a date range and type (using Madrid timezone)
export const fetchCategorySummary = async (dateFrom: string, dateTo: string, type: 'income' | 'expense'): Promise<CategorySummary[]> => {
  // Convert date strings to Madrid timezone boundaries
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  
  const startBoundaries = getMadridDayBoundaries(startDate);
  const endBoundaries = getMadridDayBoundaries(endDate);
  
  // Use the start of the first day and end of the last day
  const fromISO = startBoundaries.start.toISOString().split('T')[0];
  const toISO = endBoundaries.end.toISOString().split('T')[0];

  console.log('fetchCategorySummary: Date range in Madrid timezone for', type, ':', {
    original: { dateFrom, dateTo },
    madrid: { fromISO, toISO }
  });

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      category_id,
      transaction_categories!category_id(id, name)
    `)
    .eq("type", type)
    .gte("transaction_date", fromISO)
    .lte("transaction_date", toISO);

  if (error) throw error;

  // Group by category and sum amounts
  const categoryMap = new Map<number, { name: string; total: number }>();
  
  data?.forEach((transaction: any) => {
    const categoryId = transaction.category_id;
    const categoryName = transaction.transaction_categories?.name || 'Без категории';
    const amount = Number(transaction.amount);
    
    if (categoryMap.has(categoryId)) {
      categoryMap.get(categoryId)!.total += amount;
    } else {
      categoryMap.set(categoryId, { name: categoryName, total: amount });
    }
  });

  const result = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
    category_id: categoryId,
    category_name: data.name,
    total_amount: data.total
  }));

  console.log('fetchCategorySummary: Results for', type, ':', result);
  return result;
};

export const useFinancialSummary = (dateFrom: string, dateTo: string) => {
  return useQuery({
    queryKey: ['financial_summary', dateFrom, dateTo],
    queryFn: () => fetchFinancialSummary(dateFrom, dateTo),
  });
};

export const useCategorySummary = (dateFrom: string, dateTo: string, type: 'income' | 'expense') => {
  return useQuery({
    queryKey: ['category_summary', dateFrom, dateTo, type],
    queryFn: () => fetchCategorySummary(dateFrom, dateTo, type),
  });
};
