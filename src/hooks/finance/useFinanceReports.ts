
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Get financial summary for a date range
export const fetchFinancialSummary = async (dateFrom: string, dateTo: string) => {
  const { data, error } = await supabase
    .rpc("get_financial_summary", {
      date_from: dateFrom,
      date_to: dateTo,
    });

  if (error) throw error;
  return data as FinancialSummary;
};

// Hook for fetching financial summary
export const useFinancialSummary = (dateFrom: string | null, dateTo: string | null) => {
  return useQuery({
    queryKey: ["financial_summary", dateFrom, dateTo],
    queryFn: () => {
      if (!dateFrom || !dateTo) return null;
      return fetchFinancialSummary(dateFrom, dateTo);
    },
    enabled: !!dateFrom && !!dateTo,
  });
};

// Fetch expense categories summary
export const fetchCategorySummary = async (
  dateFrom: string, 
  dateTo: string, 
  type: "income" | "expense"
) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      category_id,
      amount,
      category:category_id(name)
    `)
    .eq("type", type)
    .gte("transaction_date", dateFrom)
    .lte("transaction_date", dateTo);

  if (error) throw error;

  // Process data to group by category
  const categorySummary: Record<number, CategorySummary> = {};
  
  data.forEach((item: any) => {
    const categoryId = item.category_id;
    if (!categorySummary[categoryId]) {
      categorySummary[categoryId] = {
        category_id: categoryId,
        category_name: item.category?.name || 'Неизвестная категория',
        total_amount: 0
      };
    }
    categorySummary[categoryId].total_amount += Number(item.amount);
  });

  return Object.values(categorySummary).sort((a, b) => b.total_amount - a.total_amount);
};

// Hook for fetching category summaries
export const useCategorySummary = (
  dateFrom: string | null, 
  dateTo: string | null,
  type: "income" | "expense"
) => {
  return useQuery({
    queryKey: [`${type}_categories_summary`, dateFrom, dateTo],
    queryFn: () => {
      if (!dateFrom || !dateTo) return [];
      return fetchCategorySummary(dateFrom, dateTo, type);
    },
    enabled: !!dateFrom && !!dateTo,
  });
};
