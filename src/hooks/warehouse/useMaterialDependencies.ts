import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MaterialDependencies {
  estimates: Array<{
    id: number;
    name: string;
    status: string;
    order_number: string;
  }>;
  reservations: Array<{
    id: number;
    order_id: number;
    order_number: string;
    quantity_reserved: number;
    location: string;
  }>;
  stockMovements: Array<{
    id: number;
    movement_type: string;
    quantity: number;
    movement_date: string;
    from_location?: string;
    to_location?: string;
  }>;
  hasBlockingDependencies: boolean;
  canDelete: boolean;
}

export const useMaterialDependencies = (materialId: number) => {
  return useQuery({
    queryKey: ['material-dependencies', materialId],
    queryFn: async (): Promise<MaterialDependencies> => {
      // Check estimates with this material
      const { data: estimates, error: estimatesError } = await supabase
        .from('estimate_items')
        .select(`
          estimate_id,
          estimates!inner(
            id,
            name,
            status,
            orders!inner(order_number)
          )
        `)
        .eq('material_id', materialId);

      if (estimatesError) throw estimatesError;

      // Check material reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('material_reservations')
        .select(`
          id,
          order_id,
          quantity_reserved,
          location,
          orders!inner(order_number)
        `)
        .eq('material_id', materialId);

      if (reservationsError) throw reservationsError;

      // Check stock movements
      const { data: stockMovements, error: movementsError } = await supabase
        .from('stock_movements')
        .select(`
          id,
          movement_type,
          quantity,
          movement_date,
          from_location,
          to_location
        `)
        .eq('material_id', materialId)
        .order('movement_date', { ascending: false })
        .limit(10);

      if (movementsError) throw movementsError;

      // Process estimates data
      const processedEstimates = (estimates || []).map((item: any) => ({
        id: item.estimates.id,
        name: item.estimates.name || `Смета #${item.estimates.id}`,
        status: item.estimates.status,
        order_number: item.estimates.orders.order_number
      }));

      // Process reservations data
      const processedReservations = (reservations || []).map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        order_number: item.orders.order_number,
        quantity_reserved: item.quantity_reserved,
        location: item.location
      }));

      // Process stock movements data
      const processedMovements = (stockMovements || []).map((item: any) => ({
        id: item.id,
        movement_type: item.movement_type,
        quantity: item.quantity,
        movement_date: item.movement_date,
        from_location: item.from_location,
        to_location: item.to_location
      }));

      // Check for blocking dependencies
      // ANY estimates block deletion due to foreign key constraints, not just approved ones
      const approvedEstimates = processedEstimates.filter(e => e.status === 'утверждена');
      const activeReservations = processedReservations.filter(r => r.quantity_reserved > 0);
      
      // Material has blocking dependencies if it has ANY estimates/reservations or stock movements
      const hasBlockingDependencies = processedEstimates.length > 0 || activeReservations.length > 0;
      const canDelete = !hasBlockingDependencies;

      return {
        estimates: processedEstimates,
        reservations: processedReservations,
        stockMovements: processedMovements,
        hasBlockingDependencies,
        canDelete
      };
    },
    enabled: !!materialId
  });
};