
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for estimates and estimate items
export interface Estimate {
  id: number;
  order_id: number;
  name?: string;
  status: string;
  total_cost?: number;
  creator_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EstimateItem {
  id: number;
  estimate_id: number;
  material_id: number;
  quantity_needed: number;
  price_at_estimation?: number;
  created_at: string;
  updated_at: string;
  materials?: {
    id: number;
    name: string;
    current_cost?: number;
    unit: string;
    category: string;
  };
}

export interface EstimateWithItems extends Estimate {
  estimate_items: EstimateItem[];
}

// Hook to get all estimates for a specific order
export const useEstimatesByOrderId = (orderId?: number) => {
  return useQuery({
    queryKey: ["estimates", "by-order", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await supabase
        .from("estimates")
        .select(`
          *,
          estimate_items (
            *,
            materials (
              id,
              name,
              current_cost,
              unit,
              category
            )
          )
        `)
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching estimates:", error);
        throw error;
      }

      return data as EstimateWithItems[];
    },
    enabled: !!orderId,
  });
};

// Hook to get a single estimate by ID with all its items
export const useEstimateById = (estimateId?: number) => {
  return useQuery({
    queryKey: ["estimates", estimateId],
    queryFn: async () => {
      if (!estimateId) return null;
      
      const { data, error } = await supabase
        .from("estimates")
        .select(`
          *,
          estimate_items (
            *,
            materials (
              id,
              name,
              current_cost,
              unit,
              category
            )
          )
        `)
        .eq("id", estimateId)
        .single();

      if (error) {
        console.error("Error fetching estimate:", error);
        throw error;
      }

      return data as EstimateWithItems;
    },
    enabled: !!estimateId,
  });
};

// Hook to create a new estimate
export const useCreateEstimate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { order_id: number; name?: string }) => {
      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          order_id: data.order_id,
          name: data.name || `Смета ${new Date().toLocaleDateString()}`,
          status: "черновик",
          creator_user_id: (await supabase.auth.getUser()).data.user?.id || "",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating estimate:", error);
        throw error;
      }

      return estimate;
    },
    onSuccess: (data) => {
      // Invalidate estimates queries
      queryClient.invalidateQueries({ queryKey: ["estimates", "by-order", data.order_id] });
      queryClient.invalidateQueries({ queryKey: ["estimates", data.id] });
      toast.success("Смета успешно создана");
    },
    onError: (error: any) => {
      console.error("Error creating estimate:", error);
      toast.error("Ошибка при создании сметы: " + error.message);
    },
  });
};

// Hook to update an estimate
export const useUpdateEstimate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { estimateId: number; updates: Partial<Estimate> }) => {
      const { data: estimate, error } = await supabase
        .from("estimates")
        .update(data.updates)
        .eq("id", data.estimateId)
        .select()
        .single();

      if (error) {
        console.error("Error updating estimate:", error);
        throw error;
      }

      return estimate;
    },
    onSuccess: (data) => {
      // Invalidate estimates queries
      queryClient.invalidateQueries({ queryKey: ["estimates", "by-order", data.order_id] });
      queryClient.invalidateQueries({ queryKey: ["estimates", data.id] });
      toast.success("Смета успешно обновлена");
    },
    onError: (error: any) => {
      console.error("Error updating estimate:", error);
      toast.error("Ошибка при обновлении сметы: " + error.message);
    },
  });
};

// Hook to delete an estimate
export const useDeleteEstimate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (estimateId: number) => {
      // First, get the estimate to know which order to invalidate
      const { data: estimate } = await supabase
        .from("estimates")
        .select("order_id")
        .eq("id", estimateId)
        .single();

      const { error } = await supabase
        .from("estimates")
        .delete()
        .eq("id", estimateId);

      if (error) {
        console.error("Error deleting estimate:", error);
        throw error;
      }

      return { estimateId, orderId: estimate?.order_id };
    },
    onSuccess: (data) => {
      // Invalidate estimates queries
      if (data.orderId) {
        queryClient.invalidateQueries({ queryKey: ["estimates", "by-order", data.orderId] });
      }
      queryClient.invalidateQueries({ queryKey: ["estimates", data.estimateId] });
      toast.success("Смета успешно удалена");
    },
    onError: (error: any) => {
      console.error("Error deleting estimate:", error);
      toast.error("Ошибка при удалении сметы: " + error.message);
    },
  });
};

// Hook to add an item to an estimate
export const useAddEstimateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      estimate_id: number;
      material_id: number;
      quantity_needed: number;
      price_at_estimation?: number;
    }) => {
      const { data: item, error } = await supabase
        .from("estimate_items")
        .insert(data)
        .select(`
          *,
          materials (
            id,
            name,
            current_cost,
            unit,
            category
          )
        `)
        .single();

      if (error) {
        console.error("Error adding estimate item:", error);
        throw error;
      }

      return item;
    },
    onSuccess: (data) => {
      // Invalidate estimate queries to refresh total cost
      queryClient.invalidateQueries({ queryKey: ["estimates", data.estimate_id] });
      // Also invalidate the order estimates list
      queryClient.invalidateQueries({ queryKey: ["estimates", "by-order"] });
      toast.success("Материал добавлен в смету");
    },
    onError: (error: any) => {
      console.error("Error adding estimate item:", error);
      toast.error("Ошибка при добавлении материала: " + error.message);
    },
  });
};

// Hook to update an estimate item
export const useUpdateEstimateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemId: number;
      updates: { quantity_needed?: number; price_at_estimation?: number };
    }) => {
      const { data: item, error } = await supabase
        .from("estimate_items")
        .update(data.updates)
        .eq("id", data.itemId)
        .select(`
          *,
          materials (
            id,
            name,
            current_cost,
            unit,
            category
          )
        `)
        .single();

      if (error) {
        console.error("Error updating estimate item:", error);
        throw error;
      }

      return item;
    },
    onSuccess: (data) => {
      // Invalidate estimate queries to refresh total cost
      queryClient.invalidateQueries({ queryKey: ["estimates", data.estimate_id] });
      // Also invalidate the order estimates list
      queryClient.invalidateQueries({ queryKey: ["estimates", "by-order"] });
      toast.success("Позиция сметы обновлена");
    },
    onError: (error: any) => {
      console.error("Error updating estimate item:", error);
      toast.error("Ошибка при обновлении позиции: " + error.message);
    },
  });
};

// Hook to delete an estimate item
export const useDeleteEstimateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      // First, get the estimate_id to know which estimate to invalidate
      const { data: item } = await supabase
        .from("estimate_items")
        .select("estimate_id")
        .eq("id", itemId)
        .single();

      const { error } = await supabase
        .from("estimate_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error deleting estimate item:", error);
        throw error;
      }

      return { itemId, estimateId: item?.estimate_id };
    },
    onSuccess: (data) => {
      // Invalidate estimate queries to refresh total cost
      if (data.estimateId) {
        queryClient.invalidateQueries({ queryKey: ["estimates", data.estimateId] });
      }
      // Also invalidate the order estimates list
      queryClient.invalidateQueries({ queryKey: ["estimates", "by-order"] });
      toast.success("Позиция удалена из сметы");
    },
    onError: (error: any) => {
      console.error("Error deleting estimate item:", error);
      toast.error("Ошибка при удалении позиции: " + error.message);
    },
  });
};
