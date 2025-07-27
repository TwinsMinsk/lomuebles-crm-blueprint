import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MovementReport, StockMovementType } from "@/types/warehouse";

interface MovementReportFilters {
  date_from: string;
  date_to: string;
  movement_type?: StockMovementType;
  material_id?: number;
  supplier_id?: number;
}

export const useMovementReport = (filters: MovementReportFilters) => {
  return useQuery({
    queryKey: ["movement-report", filters],
    queryFn: async (): Promise<MovementReport> => {
      let query = supabase
        .from("stock_movements")
        .select(`
          *,
          materials(name, unit),
          suppliers!stock_movements_supplier_id_fkey(company_name),
          orders(order_number),
          creator:profiles!stock_movements_created_by_fkey(full_name, email)
        `)
        .gte("movement_date", filters.date_from)
        .lte("movement_date", filters.date_to)
        .order("movement_date", { ascending: false });

      if (filters.movement_type) {
        query = query.eq("movement_type", filters.movement_type);
      }

      if (filters.material_id) {
        query = query.eq("material_id", filters.material_id);
      }

      if (filters.supplier_id) {
        query = query.eq("supplier_id", filters.supplier_id);
      }

      const { data: movements, error } = await query;

      if (error) {
        console.error("Error fetching movement report:", error);
        throw new Error(`Failed to fetch movement report: ${error.message}`);
      }

      const movementsWithDetails = movements?.map((movement) => ({
        ...movement,
        material_name: movement.materials?.name,
        material_unit: movement.materials?.unit,
        supplier_name: (movement.suppliers as any)?.company_name,
        order_number: movement.orders?.order_number,
        created_by_name: (movement.creator as any)?.full_name || (movement.creator as any)?.email,
      })) || [];

      // Calculate summary
      const summary = {
        total_incoming: 0,
        total_outgoing: 0,
        net_movement: 0,
        movements_count: movementsWithDetails.length,
      };

      movementsWithDetails.forEach((movement) => {
        const quantity = movement.quantity || 0;
        
        if (['Поступление', 'Возврат'].includes(movement.movement_type)) {
          summary.total_incoming += quantity;
        } else if (['Расход', 'Списание'].includes(movement.movement_type)) {
          summary.total_outgoing += quantity;
        }
      });

      summary.net_movement = summary.total_incoming - summary.total_outgoing;

      return {
        period_start: filters.date_from,
        period_end: filters.date_to,
        movements: movementsWithDetails,
        summary,
      };
    },
  });
};