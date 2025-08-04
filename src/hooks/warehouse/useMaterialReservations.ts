import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaterialReservationWithDetails {
  id: number;
  material_id: number;
  order_id: number;
  quantity_reserved: number;
  used_quantity: number;
  remaining_quantity: number; // computed
  location?: string;
  created_at: string;
  updated_at: string;
  materials?: {
    name: string;
    unit: string;
    category: string;
  };
  orders?: {
    order_number: string;
    order_name?: string;
    status: string;
  };
}

export interface ReservationSummary {
  order_id: number;
  order_number: string;
  order_name?: string;
  order_status: string;
  total_materials: number;
  materials_with_discrepancies: number;
  total_reserved: number;
  total_used: number;
  efficiency_percentage: number;
}

export const useMaterialReservations = (orderId?: number) => {
  return useQuery({
    queryKey: ['material-reservations', orderId],
    queryFn: async (): Promise<MaterialReservationWithDetails[]> => {
      let query = supabase
        .from('material_reservations')
        .select(`
          *,
          materials (name, unit, category),
          orders (order_number, order_name, status)
        `)
        .order('created_at', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching material reservations:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        remaining_quantity: item.quantity_reserved - item.used_quantity
      }));
    },
  });
};

export const useReservationSummaries = () => {
  return useQuery({
    queryKey: ['reservation-summaries'],
    queryFn: async (): Promise<ReservationSummary[]> => {
      const { data, error } = await supabase
        .from('material_reservations')
        .select(`
          order_id,
          quantity_reserved,
          used_quantity,
          orders (order_number, order_name, status)
        `);

      if (error) {
        console.error('Error fetching reservation summaries:', error);
        throw error;
      }

      // Group by order and calculate summaries
      const orderSummaries = new Map<number, ReservationSummary>();

      data?.forEach(item => {
        if (!item.orders) return;

        const orderId = item.order_id;
        const existing = orderSummaries.get(orderId);

        if (existing) {
          existing.total_materials += 1;
          existing.total_reserved += item.quantity_reserved;
          existing.total_used += item.used_quantity;
          
          // Check for discrepancy (usage differs from plan by more than 5%)
          const discrepancy = Math.abs(item.used_quantity - item.quantity_reserved) / item.quantity_reserved;
          if (discrepancy > 0.05) {
            existing.materials_with_discrepancies += 1;
          }
        } else {
          const discrepancy = Math.abs(item.used_quantity - item.quantity_reserved) / item.quantity_reserved;
          
          orderSummaries.set(orderId, {
            order_id: orderId,
            order_number: item.orders.order_number,
            order_name: item.orders.order_name,
            order_status: item.orders.status,
            total_materials: 1,
            materials_with_discrepancies: discrepancy > 0.05 ? 1 : 0,
            total_reserved: item.quantity_reserved,
            total_used: item.used_quantity,
            efficiency_percentage: 0 // Will be calculated below
          });
        }
      });

      // Calculate efficiency percentages
      return Array.from(orderSummaries.values()).map(summary => ({
        ...summary,
        efficiency_percentage: summary.total_reserved > 0 
          ? Math.round((summary.total_used / summary.total_reserved) * 100)
          : 0
      }));
    },
  });
};