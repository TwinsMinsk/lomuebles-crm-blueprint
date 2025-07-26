import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Location {
  id: number;
  name: string;
  address?: string;
  description?: string;
  is_active: boolean;
  creator_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  name: string;
  address?: string;
  description?: string;
  is_active?: boolean;
}

export interface LocationFilters {
  search?: string;
  is_active?: boolean;
}

export const useLocations = (filters?: LocationFilters) => {
  return useQuery({
    queryKey: ['locations', filters],
    queryFn: async (): Promise<Location[]> => {
      let query = supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }

      return data || [];
    }
  });
};

export const useLocation = (id: number) => {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async (): Promise<Location | null> => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    },
    enabled: !!id
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (locationData: LocationFormData): Promise<Location> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('locations')
        .insert({
          ...locationData,
          creator_user_id: userData.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating location:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Локация создана',
        description: 'Локация успешно добавлена в систему',
      });
    },
    onError: (error) => {
      console.error('Error creating location:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать локацию',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<LocationFormData> & { id: number }): Promise<Location> => {
      const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', data.id] });
      toast({
        title: 'Локация обновлена',
        description: 'Изменения успешно сохранены',
      });
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить локацию',
        variant: 'destructive',
      });
    }
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting location:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Локация удалена',
        description: 'Локация успешно удалена из системы',
      });
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить локацию',
        variant: 'destructive',
      });
    }
  });
};