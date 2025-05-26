
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Building, Package, ListChecks, Calendar, ShoppingCart, Truck, Settings, UserCog, DollarSign, BarChart3, Target, Briefcase, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  requiredRole?: string | string[];
};

type MenuGroup = {
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Аналитика",
    icon: BarChart3,
    items: [
      {
        label: "CRM Панель",
        path: "/dashboard",
        icon: LayoutDashboard
      }
    ]
  },
  {
    label: "Управление клиентами",
    icon: Users,
    items: [
      {
        label: "Лиды",
        path: "/leads",
        icon: Target
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
      }
    ]
  },
  {
    label: "Продажи и заказы",
    icon: Briefcase,
    items: [
      {
        label: "Заказы",
        path: "/orders",
        icon: Package
      },
      {
        label: "Товары CRM",
        path: "/products",
        icon: ShoppingCart
      },
      {
        label: "Поставщики",
        path: "/suppliers",
        icon: Truck,
        requiredRole: ["Главный Администратор", "Администратор"]
      },
      {
        label: "Партнеры-Изготовители",
        path: "/partners",
        icon: Users,
        requiredRole: ["Главный Администратор", "Администратор"]
      }
    ]
  },
  {
    label: "Управление задачами",
    icon: Clock,
    items: [
      {
        label: "Задачи",
        path: "/tasks",
        icon: ListChecks
      },
      {
        label: "Календарь",
        path: "/calendar",
        icon: Calendar
      }
    ]
  },
  {
    label: "Финансы",
    icon: TrendingUp,
    items: [
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
    label: "Система",
    icon: Settings,
    items: [
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
    ]
  }
];

const SidebarNavigation = () => {
  const { userRole } = useAuth();
  const location = useLocation();

  const hasAccess = (item: MenuItem) => {
    if (!item.requiredRole) return true;
    if (!userRole) return false;
    
    const requiredRoles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
    return requiredRoles.includes(userRole);
  };

  const hasGroupAccess = (group: MenuGroup) => {
    return group.items.some(item => hasAccess(item));
  };

  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem) => {
    if (!hasAccess(item)) return null;

    const isActive = isItemActive(item.path);
    
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton 
          isActive={isActive} 
          asChild 
          tooltip={item.label}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]",
            isActive 
              ? "bg-gradient-to-r from-green-600 to-accent-green text-white shadow-lg shadow-green-500/25" 
              : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-light-green hover:text-green-600"
          )}
        >
          <Link to={item.path} className="flex items-center gap-3">
            <item.icon className={cn(
              "h-5 w-5 transition-colors",
              isActive ? "text-white" : "text-gray-500"
            )} />
            <span className="font-medium">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <div className="px-3 py-[71px]">
      {menuGroups.map((group) => {
        if (!hasGroupAccess(group)) return null;
        
        return (
          <SidebarGroup key={group.label} className="mb-6">
            <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <group.icon className="h-4 w-4" />
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </div>
  );
};

export default SidebarNavigation;
