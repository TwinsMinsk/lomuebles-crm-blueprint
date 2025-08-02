import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { StockLevelWithMaterial } from '@/types/warehouse';

export const useStockLevelsByLocation = (location: string) => {
  return useQuery({
    queryKey: ['stock-levels', 'by-location', location],
    queryFn: async (): Promise<StockLevelWithMaterial[]> => {
      console.log('Fetching stock levels for location:', location);
      
      const { data, error } = await supabase
        .from('stock_levels')
        .select(`
          *,
          material:materials (
            id,
            name,
            category,
            unit,
            sku,
            min_stock_level,
            is_active,
            created_at,
            updated_at,
            creator_user_id
          )
        `)
        .eq('location', location)
        .order('current_quantity', { ascending: false });

      if (error) {
        console.error('Error fetching stock levels by location:', error);
        throw error;
      }

      console.log('Stock levels data for location', location, ':', data);
      return data || [];
    },
    enabled: !!location
  });
};