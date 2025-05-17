
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface TransactionCategory {
  id: number;
  name: string;
  type: "income" | "expense";
  description: string | null;
  creator_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCategoryFormData {
  name: string;
  type: "income" | "expense";
  description?: string | null;
}

// Fetch all transaction categories
export const fetchTransactionCategories = async () => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .select("*")
    .order("name");

  if (error) {
    toast.error(`Ошибка загрузки категорий: ${error.message}`);
    throw error;
  }

  return data as TransactionCategory[];
};

// Hook for fetching all transaction categories
export const useTransactionCategories = () => {
  return useQuery({
    queryKey: ["transaction_categories"],
    queryFn: fetchTransactionCategories,
  });
};

// Add a new transaction category
export const addTransactionCategory = async (
  categoryData: TransactionCategoryFormData,
  userId: string
) => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .insert([{ ...categoryData, creator_user_id: userId }])
    .select()
    .single();

  if (error) {
    toast.error(`Ошибка создания категории: ${error.message}`);
    throw error;
  }

  return data;
};

// Hook for adding a transaction category
export const useAddTransactionCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (categoryData: TransactionCategoryFormData) => {
      if (!user) throw new Error("Необходимо войти в систему");
      return addTransactionCategory(categoryData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction_categories"] });
      toast.success("Категория успешно создана");
    },
  });
};

// Update a transaction category
export const updateTransactionCategory = async ({
  id,
  categoryData,
}: {
  id: number;
  categoryData: Partial<TransactionCategoryFormData>;
}) => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .update(categoryData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    toast.error(`Ошибка обновления категории: ${error.message}`);
    throw error;
  }

  return data;
};

// Hook for updating a transaction category
export const useUpdateTransactionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransactionCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction_categories"] });
      toast.success("Категория успешно обновлена");
    },
  });
};

// Delete a transaction category
export const deleteTransactionCategory = async (id: number) => {
  const { error } = await supabase
    .from("transaction_categories")
    .delete()
    .eq("id", id);

  if (error) {
    toast.error(`Ошибка удаления категории: ${error.message}`);
    throw error;
  }
};

// Hook for deleting a transaction category
export const useDeleteTransactionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransactionCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction_categories"] });
      toast.success("Категория успешно удалена");
    },
  });
};
