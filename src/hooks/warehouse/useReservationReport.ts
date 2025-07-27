import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReservationReport, MaterialCategory } from "@/types/warehouse";

interface ReservationReportFilters {
  category?: MaterialCategory;
  only_with_reservations?: boolean;
}

export const useReservationReport = (filters?: ReservationReportFilters) => {
  return useQuery({
    queryKey: ["reservation-report", filters],
    queryFn: async (): Promise<ReservationReport[]> => {
      let materialsQuery = supabase
        .from("materials")
        .select(`
          id,
          name,
          category,
          unit,
          stock_levels(current_quantity, reserved_quantity)
        `)
        .eq("is_active", true);

      if (filters?.category) {
        materialsQuery = materialsQuery.eq("category", filters.category);
      }

      const { data: materials, error: materialsError } = await materialsQuery;

      if (materialsError) {
        console.error("Error fetching materials for reservation report:", materialsError);
        throw new Error(`Failed to fetch materials: ${materialsError.message}`);
      }

      // Get all reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from("material_reservations")
        .select(`
          *,
          orders(order_number)
        `);

      if (reservationsError) {
        console.error("Error fetching reservations:", reservationsError);
        throw new Error(`Failed to fetch reservations: ${reservationsError.message}`);
      }

      const report: ReservationReport[] = materials
        ?.map((material) => {
          const stockLevel = material.stock_levels?.[0];
          const materialReservations = reservations?.filter(r => r.material_id === material.id) || [];
          
          const totalReserved = materialReservations.reduce((sum, r) => sum + (r.quantity_reserved || 0), 0);
          const currentQuantity = stockLevel?.current_quantity || 0;
          const availableQuantity = currentQuantity - totalReserved;

          const reservationDetails = materialReservations.map(r => ({
            order_id: r.order_id,
            order_number: r.orders?.order_number || `Заказ #${r.order_id}`,
            reserved_quantity: r.quantity_reserved,
            location: r.location || 'Основной склад',
            created_at: r.created_at,
          }));

          return {
            material_id: material.id,
            material_name: material.name,
            category: material.category,
            unit: material.unit,
            total_reserved: totalReserved,
            available_quantity: availableQuantity,
            reservations: reservationDetails,
          };
        })
        .filter((item) => {
          if (filters?.only_with_reservations) {
            return item.reservations.length > 0;
          }
          return true;
        }) || [];

      return report;
    },
  });
};