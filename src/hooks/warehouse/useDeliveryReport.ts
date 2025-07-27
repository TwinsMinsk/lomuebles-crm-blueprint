import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MaterialDeliveryWithDetails, DeliveryStatus } from "@/types/warehouse";

interface DeliveryReportFilters {
  date_from: string;
  date_to: string;
  delivery_status?: DeliveryStatus;
  material_id?: number;
  supplier_id?: number;
  overdue_only?: boolean;
}

export const useDeliveryReport = (filters: DeliveryReportFilters) => {
  return useQuery({
    queryKey: ["delivery-report", filters],
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
        .gte("order_date", filters.date_from)
        .lte("order_date", filters.date_to)
        .order("order_date", { ascending: false });

      if (filters.delivery_status) {
        query = query.eq("delivery_status", filters.delivery_status);
      }

      if (filters.material_id) {
        query = query.eq("material_id", filters.material_id);
      }

      if (filters.supplier_id) {
        query = query.eq("supplier_id", filters.supplier_id);
      }

      if (filters.overdue_only) {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .lt("expected_delivery_date", today)
          .not("delivery_status", "in", "(Доставлено,Отменено)");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching delivery report:", error);
        throw new Error(`Failed to fetch delivery report: ${error.message}`);
      }

      return (data || []) as MaterialDeliveryWithDetails[];
    },
  });
};