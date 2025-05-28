
import React, { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

// Component to show real-time notification toasts
export const NotificationToast: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    console.log("NotificationToast: Setting up real-time listener for user:", user.id);

    // Listen for real-time updates from Supabase
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`, // Only listen for current user's notifications
        },
        (payload) => {
          console.log("NotificationToast: New notification received:", payload);
          const notification = payload.new as Notification;
          showNotificationToast(notification);
          
          // Invalidate queries to refresh the notification list and count
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        }
      )
      .subscribe();

    return () => {
      console.log("NotificationToast: Cleaning up real-time listener");
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const showNotificationToast = (notification: Notification) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <CheckCircle className="h-4 w-4" />;
        case 'warning':
          return <AlertTriangle className="h-4 w-4" />;
        case 'error':
          return <AlertCircle className="h-4 w-4" />;
        default:
          return <Info className="h-4 w-4" />;
      }
    };

    const getToastOptions = () => {
      const baseOptions = {
        description: notification.message,
        icon: getIcon(),
        duration: notification.type === 'error' ? 8000 : 5000,
        action: notification.action_url ? {
          label: "Перейти",
          onClick: () => {
            window.location.href = notification.action_url!;
          }
        } : undefined,
        style: {
          borderLeft: `4px solid ${getTypeColor(notification.type)}`,
        }
      };
      
      return baseOptions;
    };

    const getTypeColor = (type: Notification['type']) => {
      switch (type) {
        case 'success': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#3b82f6';
      }
    };

    const toastFn = notification.type === 'error' ? toast.error :
                   notification.type === 'warning' ? toast.warning :
                   notification.type === 'success' ? toast.success :
                   toast.info;

    toastFn(notification.title, getToastOptions());
  };

  return null; // This component doesn't render anything visible
};
