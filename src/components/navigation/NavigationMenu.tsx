
import React from "react";
import { Link } from "react-router-dom";
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

// Временная заглушка для проверки роли пользователя
// В будущем это будет заменено на реальную проверку из контекста авторизации
const isAdmin = true; // для демонстрации

type MenuItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
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
  { label: "Управление Пользователями", path: "/admin/users", icon: UserCog, adminOnly: true },
  { label: "Выход", path: "/logout", icon: LogOut },
];

interface NavigationMenuProps {
  onItemClick?: () => void; // Callback для закрытия мобильного меню при нажатии
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onItemClick }) => {
  const isMobile = useIsMobile();
  
  return (
    <nav className={cn(
      "flex flex-col md:flex-row md:items-center",
      isMobile ? "w-full" : ""
    )}>
      <ul className={cn(
        "flex flex-col md:flex-row md:space-x-4",
        isMobile ? "space-y-2 md:space-y-0" : ""
      )}>
        {menuItems.map((item) => {
          // Пропускаем пункт меню, если он только для админа и у пользователя нет прав админа
          if (item.adminOnly && !isAdmin) {
            return null;
          }
          
          return (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center text-gray-700 hover:text-blue-600 transition-colors",
                  isMobile ? "py-2" : ""
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
