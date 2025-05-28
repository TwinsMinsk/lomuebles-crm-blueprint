
import React, { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

// Component to show real-time notification toasts
export const NotificationToast: React.FC = () => {
  const { data: notifications = [] } = useNotifications();

  useEffect(() => {
    // Listen for real-time updates from Supabase
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`, // Only listen for current user's notifications
        },
        (payload) => {
          const notification = payload.new as Notification;
          showNotificationToast(notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

    const toastFn = notification.type === 'error' ? toast.error :
                   notification.type === 'warning' ? toast.warning :
                   notification.type === 'success' ? toast.success :
                   toast.info;

    toastFn(notification.title, {
      description: notification.message,
      icon: getIcon(),
      action: notification.action_url ? {
        label: "Перейти",
        onClick: () => {
          window.location.href = notification.action_url!;
        }
      } : undefined,
    });
  };

  return null; // This component doesn't render anything visible
};
