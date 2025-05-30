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
    supplier_name: string; // Изменено с company_name на supplier_name
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

// Update the TransactionFormData interface to make currency required
export interface TransactionFormData {
  transaction_date: Date | string;
  type: 'income' | 'expense';
  category_id: number | null;
  amount: number;
  currency: string;  // Making this explicitly required
  description?: string | null;
  payment_method?: string | null;
  related_order_id?: number | null;
  related_contact_id?: number | null;
  related_supplier_id?: number | null;
  related_partner_manufacturer_id?: number | null;
  related_user_id?: string | null;
  attached_files?: any[] | null;
}

export const fetchTransactions = async (filters?: TransactionsFilters): Promise<TransactionWithRelations[]> => {
  try {
    // Сначала получаем основные данные транзакций
    let query = supabase
      .from("transactions")
      .select(`
        *,
        category:transaction_categories!category_id(id, name, type)
      `)
      .order('transaction_date', { ascending: false });

    // Применяем фильтры
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

    const { data: transactionsData, error: transactionsError } = await query;

    if (transactionsError) throw transactionsError;
    if (!transactionsData || transactionsData.length === 0) return [];

    // Создаем массив для хранения результатов с отношениями
    const transactionsWithRelations: TransactionWithRelations[] = [];

    // Обрабатываем каждую транзакцию и добавляем связанные данные
    for (const transaction of transactionsData) {
      const transactionWithRelations = { ...transaction } as unknown as TransactionWithRelations;

      // Дозагружаем связанный заказ, если есть
      if (transaction.related_order_id) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("id, order_number, order_name")
          .eq("id", transaction.related_order_id)
          .single();
        
        transactionWithRelations.related_order = orderData || null;
      }

      // Дозагружаем связанный контакт, если есть
      if (transaction.related_contact_id) {
        const { data: contactData } = await supabase
          .from("contacts")
          .select("contact_id, full_name")
          .eq("contact_id", transaction.related_contact_id)
          .single();
        
        transactionWithRelations.related_contact = contactData || null;
      }

      // Дозагружаем связанного поставщика, если есть
      if (transaction.related_supplier_id) {
        const { data: supplierData } = await supabase
          .from("suppliers")
          .select("supplier_id, supplier_name")
          .eq("supplier_id", transaction.related_supplier_id)
          .single();
        
        transactionWithRelations.related_supplier = supplierData || null;
      }

      // Дозагружаем связанного партнера/производителя, если есть
      if (transaction.related_partner_manufacturer_id) {
        const { data: partnerData } = await supabase
          .from("partners_manufacturers")
          .select("partner_manufacturer_id, company_name")
          .eq("partner_manufacturer_id", transaction.related_partner_manufacturer_id)
          .single();
        
        transactionWithRelations.related_partner_manufacturer = partnerData || null;
      }

      // Дозагружаем связанного пользователя, если есть
      if (transaction.related_user_id) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", transaction.related_user_id)
          .single();
        
        transactionWithRelations.related_user = userData || null;
      }

      transactionsWithRelations.push(transactionWithRelations);
    }

    return transactionsWithRelations;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
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
    mutationFn: async (transactionData: TransactionFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      if (!transactionData.category_id) {
        throw new Error('Category is required');
      }

      console.log('Creating transaction with data:', transactionData);

      // Prepare files for storage - filter out any pending files and keep only real uploaded files
      const realFiles = transactionData.attached_files?.filter(file => !file.isPending) || [];
      
      console.log('Processing files:', {
        totalFiles: transactionData.attached_files?.length || 0,
        realFiles: realFiles.length,
        files: realFiles
      });

      // Create the transaction with the real files
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert({
          transaction_date: transactionData.transaction_date instanceof Date ? 
            transactionData.transaction_date.toISOString().split('T')[0] : 
            transactionData.transaction_date,
          type: transactionData.type,
          category_id: transactionData.category_id,
          amount: transactionData.amount,
          currency: transactionData.currency || 'EUR',
          description: transactionData.description,
          related_order_id: transactionData.related_order_id,
          related_contact_id: transactionData.related_contact_id,
          related_supplier_id: transactionData.related_supplier_id,
          related_partner_manufacturer_id: transactionData.related_partner_manufacturer_id,
          related_user_id: transactionData.related_user_id,
          payment_method: transactionData.payment_method,
          attached_files: realFiles, // Store the real uploaded files
          creator_user_id: user.id
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }

      console.log('Transaction created successfully:', transaction);
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      console.error('Transaction creation failed:', error);
    }
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, transactionData }: { id: string; transactionData: Partial<TransactionFormData> }) => {
      const updateData: any = { ...transactionData };
      
      // Convert Date object to string format for the database
      if (updateData.transaction_date instanceof Date) {
        updateData.transaction_date = updateData.transaction_date.toISOString().split('T')[0];
      }
      
      const { data, error } = await supabase
        .from("transactions")
        .update(updateData)
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
