
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { NotificationList } from "./NotificationList";
import { cn } from "@/lib/utils";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "relative p-2 hover:bg-gray-100 transition-all duration-200",
            unreadCount > 0 && "hover:bg-blue-50"
          )}
          aria-label={`Уведомления ${unreadCount > 0 ? `(${unreadCount} непрочитанных)` : ''}`}
        >
          <Bell 
            className={cn(
              "h-5 w-5 transition-all duration-200",
              unreadCount > 0 ? "text-blue-600 animate-pulse" : "text-gray-600"
            )} 
          />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                "bg-blue-500 hover:bg-blue-600 border-2 border-white",
                "animate-scale-in"
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 shadow-lg border-0 bg-white" 
        align="end"
        sideOffset={8}
      >
        <NotificationList onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
