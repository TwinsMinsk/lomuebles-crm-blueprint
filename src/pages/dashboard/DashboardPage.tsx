import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  useDashboardKPIs, 
  useMyTasks, 
  useAllTasks, 
  useRecentLeads, 
  useRecentOrders 
} from "@/hooks/dashboard/useDashboardData";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/common/PageHeader";
import FinancialSummaryPanel from "@/components/dashboard/FinancialSummaryPanel";
import { ModernKPICard } from "@/components/ui/modern-kpi-card";
import { 
  Calendar, 
  Clock, 
  Package, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  Target
} from "lucide-react";

const DashboardPage: React.FC = () => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  const isSpecialist = userRole === 'Замерщик' || userRole === 'Дизайнер' || userRole === 'Монтажник';
  
  // Fetch KPIs
  const { 
    data: kpiData,
    isLoading: isLoadingKPIs,
    isError: isErrorKPIs
  } = useDashboardKPIs();

  // Fetch task data based on role
  const { data: myTasks, isLoading: isLoadingMyTasks } = useMyTasks();
  const { data: allTasks, isLoading: isLoadingAllTasks } = useAllTasks();

  // Fetch recent data for admins
  const { data: recentLeads, isLoading: isLoadingRecentLeads } = useRecentLeads();
  const { data: recentOrders, isLoading: isLoadingRecentOrders } = useRecentOrders();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не задано";
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
  };

  const renderKPICards = () => {
    // For specialists, show only task-related KPI cards
    if (isSpecialist) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <ModernKPICard
            title="Задачи на сегодня"
            value={isLoadingKPIs ? "..." : (isErrorKPIs ? "Ошибка" : (kpiData?.todaysTasksCount || 0).toLocaleString())}
            description="Мои задачи с дедлайном сегодня"
            detailsLink="/tasks"
            detailsLinkText="Все задачи"
            icon={Calendar}
            iconColor="text-white"
            gradient="bg-green-500"
            isDarkBackground={true}
            loading={isLoadingKPIs}
          />
          
          <ModernKPICard
            title="Просроченные задачи"
            value={isLoadingKPIs ? "..." : (isErrorKPIs ? "Ошибка" : (kpiData?.overdueTasksCount || 0).toLocaleString())}
            description="Мои задачи с истекшим дедлайном"
            detailsLink="/tasks"
            detailsLinkText="Просмотреть"
            icon={AlertTriangle}
            iconColor="text-white"
            gradient="bg-red-500"
            isDarkBackground={true}
            loading={isLoadingKPIs}
          />
        </div>
      );
    }

    // For admins, show all KPI cards
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ModernKPICard
          title="Новые лиды"
          value={isLoadingKPIs ? "..." : (isErrorKPIs ? "Ошибка" : (kpiData?.newLeadsCount || 0).toLocaleString())}
          description="Лиды, созданные сегодня"
          detailsLink="/leads"
          detailsLinkText="Все лиды"
          icon={Target}
          iconColor="text-white"
          gradient="bg-blue-500"
          isDarkBackground={true}
          loading={isLoadingKPIs}
        />
        
        <ModernKPICard
          title="Активные заказы"
          value={isLoadingKPIs ? "..." : (isErrorKPIs ? "Ошибка" : (kpiData?.activeOrdersCount || 0).toLocaleString())}
          description="Заказы в процессе выполнения"
          detailsLink="/orders"
          detailsLinkText="Все заказы"
          icon={Package}
          iconColor="text-white"
          gradient="bg-purple-500"
          isDarkBackground={true}
          loading={isLoadingKPIs}
        />
        
        <ModernKPICard
          title="Задачи на сегодня"
          value={isLoadingKPIs ? "..." : (isErrorKPIs ? "Ошибка" : (kpiData?.todaysTasksCount || 0).toLocaleString())}
          description="Задачи с дедлайном сегодня"
          detailsLink="/tasks"
          detailsLinkText="Все задачи"
          icon={Calendar}
          iconColor="text-white"
          gradient="bg-green-500"
          isDarkBackground={true}
          loading={isLoadingKPIs}
        />
        
        <ModernKPICard
          title="Просроченные задачи"
          value={isLoadingKPIs ? "..." : (isErrorKPIs ? "Ошибка" : (kpiData?.overdueTasksCount || 0).toLocaleString())}
          description="Задачи с истекшим дедлайном"
          detailsLink="/tasks"
          detailsLinkText="Просмотреть"
          icon={AlertTriangle}
          iconColor="text-white"
          gradient="bg-red-500"
          isDarkBackground={true}
          loading={isLoadingKPIs}
        />
      </div>
    );
  };

  const renderPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
    
    if (priority === "Высокий") {
      badgeVariant = "destructive";
    } else if (priority === "Низкий") {
      badgeVariant = "outline";
    }
    
    return <Badge variant={badgeVariant}>{priority}</Badge>;
  };

  const renderStatusBadge = (status: string) => {
    let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "default";
    let icon = null;

    switch (status) {
      case "Новая":
        badgeVariant = "secondary";
        icon = <ClockIcon className="h-3 w-3 mr-1" />;
        break;
      case "В работе":
        badgeVariant = "default";
        icon = <Calendar className="h-3 w-3 mr-1" />;
        break;
      case "Выполнена":
        badgeVariant = "outline";
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case "Просрочена":
        badgeVariant = "destructive";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
    }

    return (
      <Badge variant={badgeVariant} className="flex items-center">
        {icon}
        {status}
      </Badge>
    );
  };

  // Task section for non-admin users
  const renderMyTasksSection = () => {
    if (isAdmin) return null;

    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">Мои Задачи</CardTitle>
            <Link 
              to="/tasks" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              Все задачи
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingMyTasks ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !myTasks || myTasks.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>У вас нет активных задач</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {myTasks.map((task: any) => (
                <li key={task.task_id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/tasks/${task.task_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                      >
                        {task.task_name}
                      </Link>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(task.task_status)}
                        {renderPriorityBadge(task.priority)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      {task.relatedEntityName && (
                        <span className="text-gray-600">
                          {task.relatedEntityName}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={`${task.isOverdue ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          {task.due_date ? formatDate(task.due_date) : 'Срок не задан'}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  };

  // Task section for admin users
  const renderTeamTasksSection = () => {
    if (!isAdmin) return null;

    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Задачи Команды</CardTitle>
            <Link 
              to="/tasks" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              Все задачи
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoadingAllTasks ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !allTasks || allTasks.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Нет активных задач</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {allTasks.slice(0, 4).map((task: any) => (
                <li key={task.task_id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/tasks/${task.task_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors text-sm"
                      >
                        {task.task_name}
                      </Link>
                      <div className="flex items-center gap-1">
                        {renderStatusBadge(task.task_status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col xs:flex-row xs:gap-3 text-gray-600">
                        {task.assignedUserName && (
                          <span>{task.assignedUserName}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className={`${task.isOverdue ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          {task.due_date ? formatDate(task.due_date) : 'Срок не задан'}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  };

  // Recent Leads section for admin users
  const renderRecentLeadsSection = () => {
    if (!isAdmin) return null;

    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Последние Лиды</CardTitle>
            <Link 
              to="/leads" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              Все лиды
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoadingRecentLeads ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !recentLeads || recentLeads.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
              <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Нет данных о лидах</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentLeads.slice(0, 4).map((lead: any) => (
                <li key={lead.lead_id} className="border-b border-gray-100 pb-3 last:border-0">
                  <Link 
                    to={`/leads/${lead.lead_id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors text-sm"
                  >
                    {lead.name || lead.email || lead.phone || `Лид №${lead.lead_id}`}
                  </Link>
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                    <span>{lead.assignedUser?.full_name || 'Не назначен'}</span>
                    <span>{formatDate(lead.creation_date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  };

  // Recent Orders section for admin users
  const renderRecentOrdersSection = () => {
    if (!isAdmin) return null;

    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Последние Заказы</CardTitle>
            <Link 
              to="/orders" 
              className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
            >
              Все заказы
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoadingRecentOrders ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
              <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Нет данных о заказах</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentOrders.slice(0, 4).map((order: any) => (
                <li key={order.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <Link 
                    to={`/orders/${order.id}`}
                    className="font-medium text-gray-900 hover:text-purple-600 hover:underline transition-colors text-sm"
                  >
                    №{order.order_number} - {order.contacts?.full_name || 'Контакт не указан'}
                  </Link>
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {order.order_type === 'Готовая мебель (Tilda)' ? 'Готовая' : 'На заказ'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {order.status}
                      </Badge>
                    </div>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Панель</h1>
          <p className="text-gray-600">Добро пожаловать в lomuebles.es CRM</p>
        </div>

        {/* KPI Cards */}
        {renderKPICards()}

        {/* Main Content */}
        {isAdmin ? (
          <div className="space-y-6">
            {/* Top Row - Tasks and Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderTeamTasksSection()}
              {renderRecentOrdersSection()}
            </div>

            {/* Bottom Row - Financial Report and Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialSummaryPanel />
              {renderRecentLeadsSection()}
            </div>
          </div>
        ) : (
          /* Single Column Layout for Non-Admin Users */
          <div className="max-w-4xl mx-auto">
            {renderMyTasksSection()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
