import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MaterialLocationInfo {
  location_name: string;
  available_quantity: number;
  reserved_quantity: number;
  current_quantity: number;
}

export const useAvailableLocationsForMaterial = (materialId: number | null) => {
  return useQuery({
    queryKey: ['available-locations-for-material', materialId],
    queryFn: async (): Promise<MaterialLocationInfo[]> => {
      if (!materialId) return [];
      
      const { data, error } = await supabase.rpc('get_available_locations_for_material', {
        p_material_id: materialId
      });

      if (error) {
        console.error('Error fetching available locations for material:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!materialId
  });
};