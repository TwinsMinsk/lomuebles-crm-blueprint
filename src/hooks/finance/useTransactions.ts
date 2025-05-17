
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { TransactionCategory } from "./useTransactionCategories";

export interface Transaction {
  id: string;
  transaction_date: string;
  type: "income" | "expense";
  category_id: number;
  amount: number;
  currency: string;
  description: string | null;
  related_order_id: number | null;
  related_contact_id: number | null;
  related_supplier_id: number | null;
  related_partner_manufacturer_id: number | null;
  related_user_id: string | null;
  payment_method: string | null;
  attached_files: any | null;
  creator_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithRelations extends Transaction {
  category: TransactionCategory;
  related_order?: {
    order_number: string;
    order_name?: string;
  } | null;
  related_contact?: {
    full_name: string;
  } | null;
  related_supplier?: {
    supplier_name: string;
  } | null;
  related_partner_manufacturer?: {
    company_name: string;
  } | null;
  related_user?: {
    full_name: string;
  } | null;
}

export interface TransactionFormData {
  transaction_date: string;
  type: "income" | "expense";
  category_id: number;
  amount: number;
  currency: string;
  description?: string | null;
  related_order_id?: number | null;
  related_contact_id?: number | null;
  related_supplier_id?: number | null;
  related_partner_manufacturer_id?: number | null;
  related_user_id?: string | null;
  payment_method?: string | null;
  attached_files?: any | null;
}

export interface TransactionFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
  type?: "income" | "expense" | null;
  categoryId?: number | null;
}

// Fetch transactions with filters
export const fetchTransactions = async (filters?: TransactionFilters) => {
  let query = supabase
    .from("transactions")
    .select(`
      *,
      category:category_id(id, name, type),
      related_order:related_order_id(id, order_number, order_name),
      related_contact:related_contact_id(contact_id, full_name),
      related_supplier:related_supplier_id(supplier_id, supplier_name),
      related_partner_manufacturer:related_partner_manufacturer_id(partner_manufacturer_id, company_name),
      related_user:related_user_id(id, full_name)
    `)
    .order("transaction_date", { ascending: false });

  // Apply filters if present
  if (filters) {
    if (filters.dateFrom) {
      query = query.gte("transaction_date", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("transaction_date", filters.dateTo);
    }
    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
  }

  const { data, error } = await query;

  if (error) {
    toast.error(`Ошибка загрузки операций: ${error.message}`);
    throw error;
  }

  return data as TransactionWithRelations[];
};

// Hook for fetching transactions
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });
};

// Fetch transaction by ID
export const fetchTransactionById = async (id: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      category:category_id(id, name, type),
      related_order:related_order_id(id, order_number, order_name),
      related_contact:related_contact_id(contact_id, full_name),
      related_supplier:related_supplier_id(supplier_id, supplier_name),
      related_partner_manufacturer:related_partner_manufacturer_id(partner_manufacturer_id, company_name),
      related_user:related_user_id(id, full_name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    toast.error(`Ошибка загрузки операции: ${error.message}`);
    throw error;
  }

  return data as TransactionWithRelations;
};

// Hook for fetching a transaction by ID
export const useTransactionById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => {
      if (!id) throw new Error("ID операции не указан");
      return fetchTransactionById(id);
    },
    enabled: !!id,
  });
};

// Add a new transaction
export const addTransaction = async (
  transactionData: TransactionFormData,
  userId: string
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ ...transactionData, creator_user_id: userId }])
    .select()
    .single();

  if (error) {
    toast.error(`Ошибка создания операции: ${error.message}`);
    throw error;
  }

  return data;
};

// Hook for adding a transaction
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (transactionData: TransactionFormData) => {
      if (!user) throw new Error("Необходимо войти в систему");
      return addTransaction(transactionData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Операция успешно создана");
    },
  });
};

// Update a transaction
export const updateTransaction = async ({
  id,
  transactionData,
}: {
  id: string;
  transactionData: Partial<TransactionFormData>;
}) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(transactionData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    toast.error(`Ошибка обновления операции: ${error.message}`);
    throw error;
  }

  return data;
};

// Hook for updating a transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Операция успешно обновлена");
    },
  });
};

// Delete a transaction
export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    toast.error(`Ошибка удаления операции: ${error.message}`);
    throw error;
  }
};

// Hook for deleting a transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Операция успешно удалена");
    },
  });
};
