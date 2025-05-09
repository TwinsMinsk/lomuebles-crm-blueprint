
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
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
} from "lucide-react";
import { Link } from "react-router-dom";

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

const SidebarNavigation = () => {
  const { userRole } = useAuth();
  const location = useLocation();
  
  // Check access to menu item based on user role
  const hasAccess = (item: MenuItem) => {
    if (!item.requiredRole) return true;
    if (!userRole) return false;
    
    const requiredRoles = Array.isArray(item.requiredRole) 
      ? item.requiredRole 
      : [item.requiredRole];
      
    return requiredRoles.includes(userRole);
  };

  return (
    <SidebarGroup className="bg-white">
      <SidebarGroupLabel>Меню</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            // Skip items user doesn't have access to
            if (!hasAccess(item)) {
              return null;
            }
            
            const isActive = location.pathname === item.path;
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  isActive={isActive}
                  asChild
                  tooltip={item.label}
                  className="bg-white"
                >
                  <Link to={item.path}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavigation;
