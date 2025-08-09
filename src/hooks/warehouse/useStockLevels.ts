import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockLevel, StockLevelWithMaterial, MaterialFilters } from '@/types/warehouse';
import { useToast } from '@/hooks/use-toast';

export const useStockLevels = (filters?: MaterialFilters) => {
  return useQuery({
    queryKey: ['stock_levels', filters],
    queryFn: async (): Promise<StockLevelWithMaterial[]> => {
      let query = supabase
        .from('stock_levels')
        .select(`
          *,
          material:materials(*)
        `)
        .order('status', { ascending: false }); // Show problematic stock first

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching stock levels:', error);
        throw error;
      }

      let processedData = (data || []).map((item: any) => ({
        ...item,
        material: item.material || null
      }));

      // Apply client-side filters since we're joining with materials
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          processedData = processedData.filter((item) => 
            item.material?.name?.toLowerCase().includes(searchTerm) ||
            item.material?.sku?.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.category) {
          processedData = processedData.filter((item) => 
            item.material?.category === filters.category
          );
        }

        if (filters.supplier_id) {
          processedData = processedData.filter((item) => 
            item.material?.supplier_id === filters.supplier_id
          );
        }

        if (filters.low_stock_only) {
          processedData = processedData.filter((item) => 
            item.status === 'Заканчивается' || item.status === 'Нет в наличии'
          );
        }
      }

      return processedData;
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
        .maybeSingle();

      if (error) {
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
      notes 
    }: { 
      material_id: number; 
      notes?: string; 
    }): Promise<StockLevel> => {
      const updateData: any = {};
      
      if (notes !== undefined) updateData.notes = notes;
      if (Object.keys(updateData).length === 0) {
        throw new Error('Нет изменений для сохранения');
      }

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