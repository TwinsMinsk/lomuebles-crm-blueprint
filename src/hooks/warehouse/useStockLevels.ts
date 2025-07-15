import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockLevel, StockLevelWithMaterial } from '@/types/warehouse';
import { useToast } from '@/hooks/use-toast';

export const useStockLevels = () => {
  return useQuery({
    queryKey: ['stock_levels'],
    queryFn: async (): Promise<StockLevelWithMaterial[]> => {
      const { data, error } = await supabase
        .from('stock_levels')
        .select(`
          *,
          material:materials(*)
        `)
        .order('status', { ascending: false }); // Show problematic stock first

      if (error) {
        console.error('Error fetching stock levels:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        material: item.material || null
      }));
    }
  });
};

export const useStockLevel = (materialId: number) => {
  return useQuery({
    queryKey: ['stock_level', materialId],
    queryFn: async (): Promise<StockLevel | null> => {
      const { data, error } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('material_id', materialId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    },
    enabled: !!materialId
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['low_stock_items'],
    queryFn: async (): Promise<StockLevelWithMaterial[]> => {
      const { data, error } = await supabase
        .from('stock_levels')
        .select(`
          *,
          material:materials(*)
        `)
        .in('status', ['Заканчивается', 'Нет в наличии'])
        .order('current_quantity', { ascending: true });

      if (error) {
        console.error('Error fetching low stock items:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        material: item.material || null
      }));
    }
  });
};

export const useUpdateStockLevel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      material_id, 
      reserved_quantity, 
      location, 
      notes 
    }: { 
      material_id: number; 
      reserved_quantity?: number; 
      location?: string; 
      notes?: string; 
    }): Promise<StockLevel> => {
      const updateData: any = {};
      
      if (reserved_quantity !== undefined) updateData.reserved_quantity = reserved_quantity;
      if (location !== undefined) updateData.location = location;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('stock_levels')
        .update(updateData)
        .eq('material_id', material_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stock level:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_levels'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_items'] });
      toast({
        title: 'Уровень запасов обновлен',
        description: 'Изменения успешно сохранены',
      });
    },
    onError: (error) => {
      console.error('Error updating stock level:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить уровень запасов',
        variant: 'destructive',
      });
    }
  });
};