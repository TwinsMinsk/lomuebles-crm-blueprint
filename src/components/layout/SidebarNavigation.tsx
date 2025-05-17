
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Building, Package, ListChecks, Calendar, ShoppingCart, Truck, Settings, UserCog, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  requiredRole?: string | string[];
  childItems?: MenuItem[];
  expanded?: boolean;
};

const menuItems: MenuItem[] = [
  {
    label: "CRM Панель",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Лиды",
    path: "/leads",
    icon: Users
  },
  {
    label: "Контакты",
    path: "/contacts",
    icon: Users
  },
  {
    label: "Компании",
    path: "/companies",
    icon: Building
  },
  {
    label: "Заказы",
    path: "/orders",
    icon: Package
  },
  {
    label: "Задачи",
    path: "/tasks",
    icon: ListChecks
  },
  {
    label: "Календарь",
    path: "/calendar",
    icon: Calendar
  },
  {
    label: "Товары CRM",
    path: "/products",
    icon: ShoppingCart
  },
  {
    label: "Поставщики",
    path: "/suppliers",
    icon: Truck
  },
  {
    label: "Партнеры-Изготовители",
    path: "/partners",
    icon: Users
  },
  {
    label: "Финансы",
    path: "/finance",
    icon: DollarSign,
    requiredRole: ["Главный Администратор", "Администратор"],
    childItems: [
      {
        label: "Категории",
        path: "/finance/categories",
        icon: DollarSign,
        requiredRole: ["Главный Администратор", "Администратор"]
      },
      {
        label: "Операции",
        path: "/finance/transactions",
        icon: DollarSign,
        requiredRole: ["Главный Администратор", "Администратор"]
      },
      {
        label: "Отчеты",
        path: "/finance/reports",
        icon: DollarSign,
        requiredRole: ["Главный Администратор", "Администратор"]
      }
    ]
  },
  {
    label: "Настройки",
    path: "/settings",
    icon: Settings
  },
  {
    label: "Управление Пользователями",
    path: "/admin/users",
    icon: UserCog,
    requiredRole: ["Главный Администратор", "Администратор"]
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

  // Check if the current path is in a child item
  const isChildActive = (item: MenuItem) => {
    if (!item.childItems) return false;
    return item.childItems.some(child => location.pathname === child.path);
  };

  const renderMenuItem = (item: MenuItem) => {
    // Skip items user doesn't have access to
    if (!hasAccess(item)) {
      return null;
    }
    
    const isActive = location.pathname === item.path || isChildActive(item);
    const hasChildren = item.childItems && item.childItems.length > 0;
    
    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton 
            isActive={isActive} 
            tooltip={item.label} 
            className={cn(
              "bg-white",
              isActive && "bg-light-green text-accent-green"
            )}
          >
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
          
          {item.childItems.map(childItem => {
            if (!hasAccess(childItem)) return null;
            
            const isChildItemActive = location.pathname === childItem.path;
            
            return (
              <SidebarMenuItem key={childItem.path} className="pl-6">
                <SidebarMenuButton 
                  isActive={isChildItemActive} 
                  asChild 
                  tooltip={childItem.label} 
                  className={cn(
                    "bg-white",
                    isChildItemActive && "bg-light-green text-accent-green"
                  )}
                >
                  <Link to={childItem.path}>
                    <childItem.icon />
                    <span>{childItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenuItem>
      );
    }
    
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton 
          isActive={isActive} 
          asChild 
          tooltip={item.label} 
          className={cn(
            "bg-white",
            isActive && "bg-light-green text-accent-green"
          )}
        >
          <Link to={item.path}>
            <item.icon />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarGroup className="bg-white my-[34px]">
      <SidebarGroupLabel>Меню</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

// Add the import for cn utility
import { cn } from "@/lib/utils";

export default SidebarNavigation;
