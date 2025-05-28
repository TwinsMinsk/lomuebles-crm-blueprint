
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

// Base query key for all notification-related queries
const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

// Hook to fetch notifications for the current user
export const useNotifications = (limit?: number) => {
  return useQuery({
    queryKey: limit ? [...NOTIFICATIONS_QUERY_KEY, 'limited', limit] : NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      console.log("Fetching notifications...", limit ? `(limit: ${limit})` : "(no limit)");
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
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

// Hook to fetch unread notifications count
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'unread-count'],
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
    staleTime: 10000,
    refetchInterval: 30000,
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
    onSuccess: () => {
      // Invalidate all notification queries to refresh the data
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      console.log("Successfully marked notification as read");
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Не удалось отметить уведомление как прочитанное');
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
      // Invalidate all notification queries to refresh the data
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      console.log("Successfully marked all notifications as read");
      toast.success('Все уведомления отмечены как прочитанные');
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('Не удалось отметить все уведомления как прочитанные');
    },
  });
};

// Hook to get recent notifications (useful for dashboard)
export const useRecentNotifications = (limit = 5) => {
  return useNotifications(limit);
};
