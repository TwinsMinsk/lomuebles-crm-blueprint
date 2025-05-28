
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
    onMutate: async (notificationId) => {
      console.log("Optimistically removing notification from cache:", notificationId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] });

      // Snapshot the previous values
      const previousNotifications = queryClient.getQueryData(['notifications']) as Notification[] | undefined;
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread-count']) as number | undefined;

      // Find the notification being deleted to check if it was unread
      const deletedNotification = previousNotifications?.find(n => n.id === notificationId);
      const wasUnread = deletedNotification && !deletedNotification.is_read;

      // Optimistically update notifications list
      if (previousNotifications) {
        queryClient.setQueryData(['notifications'], 
          previousNotifications.filter(notification => notification.id !== notificationId)
        );
      }

      // Optimistically update unread count if the deleted notification was unread
      if (wasUnread && previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], 
          Math.max(0, previousUnreadCount - 1)
        );
      }

      // Return context object with the previous values
      return { previousNotifications, previousUnreadCount, deletedNotification };
    },
    onError: (error, notificationId, context) => {
      console.error('Error deleting notification, rolling back optimistic update:', error);
      
      // Rollback the optimistic updates
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count'], context.previousUnreadCount);
      }
      
      toast.error('Не удалось удалить уведомление');
    },
    onSuccess: (_, notificationId) => {
      console.log("Successfully deleted notification:", notificationId);
      toast.success('Уведомление удалено');
    },
    onSettled: () => {
      // Always refetch after success or error to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};
