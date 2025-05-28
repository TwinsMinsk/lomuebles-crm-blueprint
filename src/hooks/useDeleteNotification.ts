
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

      console.log("Successfully deleted notification:", notificationId);
    },
    onSuccess: () => {
      // Invalidate all notification queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.log("Notification deleted successfully");
      toast.success('Уведомление удалено');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Не удалось удалить уведомление');
    },
  });
};
