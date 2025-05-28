
import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  CheckCheck,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  type Notification
} from "@/hooks/useNotifications";
import { useDeleteNotification } from "@/hooks/useDeleteNotification";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification.id, notification.action_url);
    if (notification.action_url) {
      onClose();
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Marking notification as read:", notificationId);
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Deleting notification:", notificationId);
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log("Marking all notifications as read");
    markAllAsReadMutation.mutate();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="w-80 bg-white border rounded-lg shadow-lg">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border rounded-lg shadow-lg">
      {/* Fixed Header */}
      <div className="p-4 border-b bg-gray-50/50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Уведомления</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs p-2 hover:bg-blue-50 text-blue-600"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Все прочитано
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-80 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">Нет уведомлений</p>
            <p className="text-xs text-gray-400 mt-1">Новые уведомления появятся здесь</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  onNotificationClick={handleNotificationClick}
                  onClose={onClose}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

// Separate component for individual notification items
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (e: React.MouseEvent, notificationId: string) => void;
  onDelete: (e: React.MouseEvent, notificationId: string) => void;
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
}> = ({ notification, onMarkAsRead, onDelete, onNotificationClick, onClose }) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleClick = () => {
    onNotificationClick(notification);
  };

  const content = (
    <div className="flex items-start gap-3 p-4">
      <div className="mt-0.5 flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm font-medium leading-5 ${
              !notification.is_read ? 'text-gray-900' : 'text-gray-600'
            }`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1 leading-5">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {format(new Date(notification.created_at), "dd MMM yyyy, HH:mm", { locale: ru })}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onMarkAsRead(e, notification.id)}
                className="p-1 h-6 w-6 hover:bg-blue-100 text-blue-600"
                title="Отметить как прочитанное"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            {notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(e, notification.id)}
                className="p-1 h-6 w-6 hover:bg-red-100 text-red-600"
                title="Удалить уведомление"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const containerClasses = `transition-all duration-200 cursor-pointer ${
    !notification.is_read 
      ? 'bg-blue-50/70 hover:bg-blue-50 border-l-4 border-l-blue-400' 
      : 'hover:bg-gray-50'
  }`;

  if (notification.action_url) {
    return (
      <div className={containerClasses} onClick={handleClick}>
        <Link 
          to={notification.action_url}
          className="block"
          onClick={onClose}
        >
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className={containerClasses} onClick={handleClick}>
      {content}
    </div>
  );
};
