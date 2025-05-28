
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

// Hook to fetch notifications for the current user
export const useNotifications = (limit?: number) => {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: async () => {
      console.log("Fetching notifications...");
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} notifications`);
      return data as Notification[];
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute as fallback
  });
};

// Hook to fetch unread notifications count
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      console.log("Fetching unread notifications count...");
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }

      console.log(`Unread notifications count: ${count || 0}`);
      return count || 0;
    },
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Hook to mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.log("Marking notification as read:", notificationId);
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    onSuccess: (_, notificationId) => {
      console.log("Successfully marked notification as read:", notificationId);
      
      // Optimistically update the cache
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        );
      });

      // Update unread count optimistically
      queryClient.setQueryData(['notifications', 'unread-count'], (oldCount: number | undefined) => {
        return Math.max(0, (oldCount || 0) - 1);
      });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      toast.error('Не удалось отметить уведомление как прочитанное');
      console.error('Error marking notification as read:', error);
    },
  });
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log("Marking all notifications as read");
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Successfully marked all notifications as read");
      
      // Optimistically update the cache
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notification => 
          notification.is_read ? notification : { 
            ...notification, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }
        );
      });

      // Set unread count to 0
      queryClient.setQueryData(['notifications', 'unread-count'], 0);

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      
      toast.success('Все уведомления отмечены как прочитанные');
    },
    onError: (error) => {
      toast.error('Не удалось отметить все уведомления как прочитанные');
      console.error('Error marking all notifications as read:', error);
    },
  });
};

// Hook to get recent notifications (useful for dashboard)
export const useRecentNotifications = (limit = 5) => {
  return useNotifications(limit);
};
