
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Notification } from "./useNotifications";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.log("Deleting notification:", notificationId);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    },
    onSuccess: (_, notificationId) => {
      console.log("Successfully deleted notification:", notificationId);
      
      // Optimistically update the cache
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(notification => notification.id !== notificationId);
      });

      // Update unread count if the deleted notification was unread
      queryClient.setQueryData(['notifications', 'unread-count'], (oldCount: number | undefined) => {
        const oldNotifications = queryClient.getQueryData(['notifications']) as Notification[] | undefined;
        const deletedNotification = oldNotifications?.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.is_read) {
          return Math.max(0, (oldCount || 0) - 1);
        }
        return oldCount;
      });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      
      toast.success('Уведомление удалено');
    },
    onError: (error) => {
      toast.error('Не удалось удалить уведомление');
      console.error('Error deleting notification:', error);
    },
  });
};
