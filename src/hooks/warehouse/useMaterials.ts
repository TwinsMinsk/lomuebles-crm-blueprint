import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Material, MaterialFormData, MaterialFilters, MaterialWithStock } from '@/types/warehouse';
import { useToast } from '@/hooks/use-toast';

export const useMaterials = (filters?: MaterialFilters) => {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: async (): Promise<MaterialWithStock[]> => {
      console.log('useMaterials: Starting query with filters:', filters);
      
      let query = supabase
        .from('materials')
        .select(`
          *,
          stock_levels(*),
          supplier:suppliers(supplier_name)
        `)
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching materials:', error);
        throw error;
      }

      console.log('useMaterials: Raw data from Supabase:', data);

      // Process the data to extract stock levels correctly
      let materials = (data || []).map((item: any) => {
        console.log('Processing material:', item.name, 'Stock levels:', item.stock_levels);
        
        // Extract the first stock level (should be only one per material)
        const stockLevel = item.stock_levels && item.stock_levels.length > 0 ? item.stock_levels[0] : null;
        
        const processedMaterial = {
          ...item,
          stock_level: stockLevel,
          supplier_name: item.supplier?.supplier_name || null
        };
        
        console.log('Processed material:', processedMaterial.name, 'Final stock_level:', processedMaterial.stock_level);
        
        return processedMaterial;
      });

      console.log('useMaterials: Processed materials:', materials);

      // Apply low stock filter on client side
      if (filters?.low_stock_only) {
        materials = materials.filter((material: MaterialWithStock) => 
          material.stock_level && 
          material.stock_level.current_quantity <= material.min_stock_level
        );
      }

      console.log('useMaterials: Final materials after filtering:', materials);
      return materials;
    }
  });
};

export const useMaterial = (id: number) => {
  return useQuery({
    queryKey: ['material', id],
    queryFn: async (): Promise<MaterialWithStock | null> => {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          stock_levels(*),
          supplier:suppliers(supplier_name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return {
        ...data,
        stock_level: data.stock_levels?.[0] || null,
        supplier_name: data.supplier?.supplier_name || null
      };
    },
    enabled: !!id
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (materialData: MaterialFormData): Promise<Material> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...materialData,
          creator_user_id: userData.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating material:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Материал создан',
        description: 'Материал успешно добавлен в систему',
      });
    },
    onError: (error) => {
      console.error('Error creating material:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать материал',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MaterialFormData> & { id: number }): Promise<Material> => {
      const { data, error } = await supabase
        .from('materials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating material:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', data.id] });
      toast({
        title: 'Материал обновлен',
        description: 'Изменения успешно сохранены',
      });
    },
    onError: (error) => {
      console.error('Error updating material:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить материал',
        variant: 'destructive',
      });
    }
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Материал удален',
        description: 'Материал успешно удален из системы',
      });
    },
    onError: (error) => {
      console.error('Error deleting material:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить материал',
        variant: 'destructive',
      });
    }
  });
};
