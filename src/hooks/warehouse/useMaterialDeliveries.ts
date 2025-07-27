import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MaterialDelivery, MaterialDeliveryWithDetails, MaterialDeliveryFilters, MaterialDeliveryFormData } from "@/types/warehouse";

export const useMaterialDeliveries = (filters?: MaterialDeliveryFilters) => {
  return useQuery({
    queryKey: ["material-deliveries", filters],
    queryFn: async (): Promise<MaterialDeliveryWithDetails[]> => {
      let query = supabase
        .from("material_deliveries")
        .select(`
          *,
          material:materials(id, name, category, unit),
          supplier:suppliers!material_deliveries_supplier_id_fkey(supplier_id, company_name),
          order:orders(id, order_number, order_name),
          creator:profiles!material_deliveries_created_by_fkey(id, full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (filters?.delivery_status) {
        query = query.eq("delivery_status", filters.delivery_status);
      }

      if (filters?.material_id) {
        query = query.eq("material_id", filters.material_id);
      }

      if (filters?.supplier_id) {
        query = query.eq("supplier_id", filters.supplier_id);
      }

      if (filters?.order_id) {
        query = query.eq("order_id", filters.order_id);
      }

      if (filters?.date_from) {
        query = query.gte("order_date", filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte("order_date", filters.date_to);
      }

      if (filters?.overdue_only) {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .lt("expected_delivery_date", today)
          .not("delivery_status", "in", "(Доставлено,Отменено)");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching material deliveries:", error);
        throw new Error(`Failed to fetch deliveries: ${error.message}`);
      }

      return (data || []) as unknown as MaterialDeliveryWithDetails[];
    },
  });
};

export const useMaterialDelivery = (id: number) => {
  return useQuery({
    queryKey: ["material-delivery", id],
    queryFn: async (): Promise<MaterialDeliveryWithDetails | null> => {
      const { data, error } = await supabase
        .from("material_deliveries")
        .select(`
          *,
          material:materials(id, name, category, unit),
          supplier:suppliers!material_deliveries_supplier_id_fkey(supplier_id, company_name),
          order:orders(id, order_number, order_name),
          creator:profiles!material_deliveries_created_by_fkey(id, full_name, email)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching material delivery:", error);
        throw new Error(`Failed to fetch delivery: ${error.message}`);
      }

      return data as unknown as MaterialDeliveryWithDetails | null;
    },
    enabled: !!id,
  });
};

export const useCreateMaterialDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliveryData: MaterialDeliveryFormData): Promise<MaterialDelivery> => {
      const { data, error } = await supabase
        .from("material_deliveries")
        .insert(deliveryData)
        .select()
        .single();

      if (error) {
        console.error("Error creating material delivery:", error);
        throw new Error(`Failed to create delivery: ${error.message}`);
      }

      return data as MaterialDelivery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-deliveries"] });
      toast.success("Поставка успешно создана");
    },
    onError: (error: Error) => {
      console.error("Create delivery error:", error);
      toast.error(`Ошибка при создании поставки: ${error.message}`);
    },
  });
};

export const useUpdateMaterialDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<MaterialDeliveryFormData> }): Promise<MaterialDelivery> => {
      const { data, error } = await supabase
        .from("material_deliveries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating material delivery:", error);
        throw new Error(`Failed to update delivery: ${error.message}`);
      }

      return data as MaterialDelivery;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["material-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["material-delivery", id] });
      toast.success("Поставка успешно обновлена");
    },
    onError: (error: Error) => {
      console.error("Update delivery error:", error);
      toast.error(`Ошибка при обновлении поставки: ${error.message}`);
    },
  });
};

export const useDeleteMaterialDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from("material_deliveries")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting material delivery:", error);
        throw new Error(`Failed to delete delivery: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-deliveries"] });
      toast.success("Поставка успешно удалена");
    },
    onError: (error: Error) => {
      console.error("Delete delivery error:", error);
      toast.error(`Ошибка при удалении поставки: ${error.message}`);
    },
  });
};