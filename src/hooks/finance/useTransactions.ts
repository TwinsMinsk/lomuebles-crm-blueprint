
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface TransactionCategory {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
  creator_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_date: string;
  type: 'income' | 'expense';
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
  attached_files: any[] | null;
  creator_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithRelations extends Transaction {
  category: TransactionCategory;
  related_order?: {
    id: number;
    order_number: string;
    order_name: string | null;
  } | null;
  related_contact?: {
    contact_id: number;
    full_name: string;
  } | null;
  related_supplier?: {
    supplier_id: number;
    company_name: string;
  } | null;
  related_partner_manufacturer?: {
    partner_manufacturer_id: number;
    company_name: string;
  } | null;
  related_user?: {
    id: string;
    full_name: string;
  } | null;
}

export interface TransactionsFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'all';
  categoryId?: number;
}

export const fetchTransactions = async (filters?: TransactionsFilters): Promise<TransactionWithRelations[]> => {
  let query = supabase
    .from("transactions")
    .select(`
      *,
      category:transaction_categories!category_id(id, name, type),
      related_order:related_order_id(id, order_number, order_name),
      related_contact:related_contact_id(contact_id, full_name),
      related_supplier:related_supplier_id(supplier_id, company_name),
      related_partner_manufacturer:related_partner_manufacturer_id(partner_manufacturer_id, company_name),
      related_user:related_user_id(id, full_name)
    `)
    .order('transaction_date', { ascending: false });

  // Apply filters
  if (filters) {
    if (filters.dateFrom) {
      query = query.gte('transaction_date', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('transaction_date', filters.dateTo);
    }
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data to match our interface
  const transformedData: TransactionWithRelations[] = data.map(item => {
    const transaction = item as unknown as TransactionWithRelations;
    return transaction;
  });

  return transformedData;
};

export const useTransactions = (filters?: TransactionsFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  });
};

export const fetchTransactionById = async (id: string): Promise<TransactionWithRelations | null> => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      category:transaction_categories!category_id(id, name, type),
      related_order:related_order_id(id, order_number, order_name),
      related_contact:related_contact_id(contact_id, full_name),
      related_supplier:related_supplier_id(supplier_id, company_name),
      related_partner_manufacturer:related_partner_manufacturer_id(partner_manufacturer_id, company_name),
      related_user:related_user_id(id, full_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Record not found
    throw error;
  }

  // Transform data to match our interface
  const transaction = data as unknown as TransactionWithRelations;
  return transaction;
};

export const useTransactionById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => {
      if (!id) return null;
      return fetchTransactionById(id);
    },
    enabled: !!id,
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transactionData: Partial<Transaction>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from("transactions")
        .insert([{
          ...transactionData,
          creator_user_id: user.id
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, transactionData }: { id: string; transactionData: Partial<Transaction> }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
