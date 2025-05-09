
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  Package,
  ListChecks,
  Calendar,
  ShoppingCart,
  Truck,
  Settings,
  UserCog,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  requiredRole?: string | string[];
};

const menuItems: MenuItem[] = [
  { label: "CRM Панель", path: "/dashboard", icon: LayoutDashboard },
  { label: "Лиды", path: "/leads", icon: Users },
  { label: "Контакты", path: "/contacts", icon: Users },
  { label: "Компании", path: "/companies", icon: Building },
  { label: "Заказы", path: "/orders", icon: Package },
  { label: "Задачи", path: "/tasks", icon: ListChecks },
  { label: "Календарь", path: "/calendar", icon: Calendar },
  { label: "Товары CRM", path: "/products", icon: ShoppingCart },
  { label: "Поставщики", path: "/suppliers", icon: Truck },
  { label: "Партнеры-Изготовители", path: "/partners", icon: Users },
  { label: "Настройки", path: "/settings", icon: Settings },
  { 
    label: "Управление Пользователями", 
    path: "/admin/users", 
    icon: UserCog, 
    requiredRole: "Главный Администратор"
  }
];

interface NavigationMenuProps {
  onItemClick?: () => void; // Callback для закрытия мобильного меню при нажатии
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onItemClick }) => {
  const isMobile = useIsMobile();
  const { userRole } = useAuth();
  const location = useLocation();
  
  // Проверка доступа к пункту меню на основе роли пользователя
  const hasAccess = (item: MenuItem) => {
    if (!item.requiredRole) return true;
    if (!userRole) return false;
    
    const requiredRoles = Array.isArray(item.requiredRole) 
      ? item.requiredRole 
      : [item.requiredRole];
      
    return requiredRoles.includes(userRole);
  };
  
  return (
    <nav className={cn(
      "flex flex-col md:flex-row md:items-center bg-white md:bg-transparent",
      isMobile ? "w-full" : ""
    )}>
      <ul className={cn(
        "flex flex-col md:flex-row md:space-x-4",
        isMobile ? "space-y-2 md:space-y-0" : ""
      )}>
        {menuItems.map((item) => {
          // Пропускаем пункты меню, к которым у пользователя нет доступа
          if (!hasAccess(item)) {
            return null;
          }
          
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center transition-colors",
                  isActive 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-700 hover:text-blue-600",
                  isMobile ? "py-2 px-2 bg-white w-full block" : ""
                )}
                onClick={onItemClick}
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationMenu;
