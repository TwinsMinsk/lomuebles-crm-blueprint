import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { StockMovementType } from '@/types/warehouse';

interface ValidationParams {
  materialId: number | null;
  fromLocation: string | null;
  quantity: number | null;
  movementType: StockMovementType | null;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  available_quantity?: number;
  requested_quantity?: number;
}

export const useStockMovementValidation = ({
  materialId,
  fromLocation,
  quantity,
  movementType
}: ValidationParams) => {
  return useQuery({
    queryKey: ['stock-movement-validation', materialId, fromLocation, quantity, movementType],
    queryFn: async (): Promise<ValidationResult> => {
      if (!materialId || !quantity || !movementType) {
        return { valid: true, message: 'Validation skipped - missing parameters' };
      }

      const { data, error } = await supabase.rpc('validate_stock_movement_availability', {
        p_material_id: materialId,
        p_from_location: fromLocation,
        p_quantity: quantity,
        p_movement_type: movementType
      });

      if (error) {
        console.error('Error validating stock movement:', error);
        throw error;
      }

      // Type assertion for the RPC result
      if (data && typeof data === 'object' && 'valid' in data) {
        return data as unknown as ValidationResult;
      }
      
      return { valid: false, message: 'Unknown validation error' };
    },
    enabled: !!(materialId && quantity && movementType),
    staleTime: 1000 * 30, // 30 seconds
  });
};