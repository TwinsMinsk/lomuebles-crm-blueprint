import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockMovement, StockMovementFormData, StockMovementFilters, StockMovementWithDetails } from '@/types/warehouse';
import { useToast } from '@/hooks/use-toast';

export const useStockMovements = (filters?: StockMovementFilters) => {
  return useQuery({
    queryKey: ['stock_movements', filters],
    queryFn: async (): Promise<StockMovementWithDetails[]> => {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          material:materials(name, unit),
          supplier:suppliers(supplier_name),
          order:orders(order_number)
        `)
        .order('movement_date', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`reference_document.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      if (filters?.movement_type) {
        query = query.eq('movement_type', filters.movement_type);
      }

      if (filters?.material_id) {
        query = query.eq('material_id', filters.material_id);
      }

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters?.order_id) {
        query = query.eq('order_id', filters.order_id);
      }

      if (filters?.date_from) {
        query = query.gte('movement_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('movement_date', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching stock movements:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        material_name: item.material?.name || null,
        material_unit: item.material?.unit || null,
        supplier_name: item.supplier?.supplier_name || null,
        order_number: item.order?.order_number || null,
        created_by_name: null // Will be populated separately if needed
      }));
    }
  });
};

export const useStockMovement = (id: number) => {
  return useQuery({
    queryKey: ['stock_movement', id],
    queryFn: async (): Promise<StockMovementWithDetails | null> => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          material:materials(name, unit),
          supplier:suppliers(supplier_name),
          order:orders(order_number)
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
        material_name: data.material?.name || null,
        material_unit: data.material?.unit || null,
        supplier_name: data.supplier?.supplier_name || null,
        order_number: data.order?.order_number || null,
        created_by_name: null // Will be populated separately if needed
      };
    },
    enabled: !!id
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (movementData: StockMovementFormData): Promise<StockMovement> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          ...movementData,
          created_by: userData.user.id,
          movement_date: movementData.movement_date || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating stock movement:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_levels'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Движение запасов создано',
        description: 'Операция успешно зарегистрирована',
      });
    },
    onError: (error) => {
      console.error('Error creating stock movement:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать движение запасов',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateStockMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<StockMovementFormData> & { id: number }): Promise<StockMovement> => {
      const { data, error } = await supabase
        .from('stock_movements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stock movement:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movement', data.id] });
      queryClient.invalidateQueries({ queryKey: ['stock_levels'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Движение запасов обновлено',
        description: 'Изменения успешно сохранены',
      });
    },
    onError: (error) => {
      console.error('Error updating stock movement:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить движение запасов',
        variant: 'destructive',
      });
    }
  });
};

export const useDeleteStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      console.log('Attempting to delete movement with id:', id);
      
      // Check if user is authenticated before attempting deletion
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Сессия истекла. Пожалуйста, войдите в систему заново.');
      }
      
      const { error } = await supabase
        .from('stock_movements')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting stock movement:', error);
        
        // Handle specific error types
        if (error.code === '42501') {
          throw new Error('У вас нет прав для удаления записей. Обратитесь к администратору.');
        } else if (error.code === 'PGRST301') {
          throw new Error('Сессия истекла. Пожалуйста, войдите в систему заново.');
        } else {
          throw new Error(error.message || 'Произошла ошибка при удалении записи.');
        }
      }
      
      console.log('Successfully deleted movement with id:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_levels'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (error) => {
      console.error('Error deleting stock movement:', error);
    },
  });
};