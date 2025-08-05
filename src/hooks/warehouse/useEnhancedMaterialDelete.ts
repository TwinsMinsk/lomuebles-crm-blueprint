import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CascadeDeleteOptions {
  cancelEstimates?: boolean;
  removeEstimates?: boolean;
  clearReservations?: boolean;
  archiveData?: boolean;
}

export const useEnhancedMaterialDelete = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ materialId, cascadeOptions }: { materialId: number; cascadeOptions?: CascadeDeleteOptions }): Promise<void> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Пользователь не авторизован');
      }

      // Start a transaction-like approach by handling cascades first
      if (cascadeOptions?.cancelEstimates) {
        // Cancel approved estimates that use this material by updating their status
        const { data: estimateItems } = await supabase
          .from('estimate_items')
          .select('estimate_id')
          .eq('material_id', materialId);
        
        if (estimateItems && estimateItems.length > 0) {
          const estimateIds = estimateItems.map(item => item.estimate_id);
          const { error: estimateError } = await supabase
            .from('estimates')
            .update({ status: 'отменена' })
            .in('id', estimateIds)
            .eq('status', 'утверждена'); // Only cancel approved estimates
          
          if (estimateError) {
            console.error('Error canceling estimates:', estimateError);
            // Continue anyway - this is a best effort operation
          }
        }
      }

      if (cascadeOptions?.removeEstimates) {
        // Remove estimate items that use this material (except for approved estimates)
        const { error: removeError } = await supabase
          .from('estimate_items')
          .delete()
          .eq('material_id', materialId)
          .not('estimate_id', 'in', 
            // Get IDs of approved estimates to exclude them
            await supabase
              .from('estimates')
              .select('id')
              .eq('status', 'утверждена')
              .then(({ data }) => data?.map(e => e.id) || [])
          );
        
        if (removeError) {
          console.error('Error removing estimate items:', removeError);
        }
      }

      if (cascadeOptions?.clearReservations) {
        // Clear material reservations
        const { error: reservationError } = await supabase
          .from('material_reservations')
          .delete()
          .eq('material_id', materialId);
        
        if (reservationError) {
          console.error('Error clearing reservations:', reservationError);
          // Continue anyway
        }
      }

      if (cascadeOptions?.archiveData) {
        // Mark material as inactive instead of deleting
        const materialName = await getMaterialName(materialId);
        const { error: archiveError } = await supabase
          .from('materials')
          .update({ 
            is_active: false,
            name: `[АРХИВ] ${Date.now()} ${materialName}`
          })
          .eq('id', materialId);

        if (archiveError) {
          throw archiveError;
        }

        return; // Don't delete if archiving
      }

      // If no archive option, proceed with deletion
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) {
        console.error('Error deleting material:', error);
        throw error;
      }
    },
    onSuccess: (_, { cascadeOptions }) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material-dependencies'] });
      
      const action = cascadeOptions?.archiveData ? 'архивирован' : 'удален';
      toast({
        title: `Материал ${action}`,
        description: `Материал успешно ${action} из системы`,
      });
    },
    onError: (error) => {
      console.error('Error in material deletion:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить операцию с материалом',
        variant: 'destructive',
      });
    }
  });
};

// Helper function to get material name
async function getMaterialName(materialId: number): Promise<string> {
  const { data, error } = await supabase
    .from('materials')
    .select('name')
    .eq('id', materialId)
    .single();
  
  return data?.name || `Material-${materialId}`;
}