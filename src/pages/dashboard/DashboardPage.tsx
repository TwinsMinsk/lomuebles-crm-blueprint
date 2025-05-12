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
import { 
  Calendar, 
  Clock, 
  Package, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react";

const DashboardPage: React.FC = () => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  
  // Fetch KPIs
  const { 
    newLeadsCount, 
    activeOrdersCount, 
    todaysTasksCount, 
    overdueTasksCount, 
    isLoading: isLoadingKPIs,
    isError: isErrorKPIs
  } = useDashboardKPIs();

  // Fetch task data based on role
  const { data: myTasks, isLoading: isLoadingMyTasks } = useMyTasks();
  const { data: allTasks, isLoading: isLoadingAllTasks } = useAllTasks();

  // Fetch recent data for admins
  const { data: recentLeads, isLoading: isLoadingRecentLeads } = useRecentLeads();
  const { data: recentOrders, isLoading: isLoadingRecentOrders } = useRecentOrders();

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не задано";
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
  };

  // Function to render KPI cards
  const renderKPICards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* New Leads KPI */}
        <Card className="shadow-sm border-t-4 border-t-accent-green">
          <CardHeader className="bg-light-green">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Новые лиды сегодня
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingKPIs ? (
              <Skeleton className="h-10 w-16" />
            ) : isErrorKPIs ? (
              <div className="text-red-500">Ошибка загрузки</div>
            ) : (
              <div className="text-3xl font-bold">{newLeadsCount}</div>
            )}
          </CardContent>
        </Card>

        {/* Active Orders KPI */}
        <Card className="shadow-sm border-t-4 border-t-accent-green">
          <CardHeader className="bg-light-green">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Активные заказы
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingKPIs ? (
              <Skeleton className="h-10 w-16" />
            ) : isErrorKPIs ? (
              <div className="text-red-500">Ошибка загрузки</div>
            ) : (
              <div className="text-3xl font-bold">{activeOrdersCount}</div>
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks KPI */}
        <Card className="shadow-sm border-t-4 border-t-accent-green">
          <CardHeader className="bg-light-green">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Задачи на сегодня
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingKPIs ? (
              <Skeleton className="h-10 w-16" />
            ) : isErrorKPIs ? (
              <div className="text-red-500">Ошибка загрузки</div>
            ) : (
              <div className="text-3xl font-bold">{todaysTasksCount}</div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks KPI */}
        <Card className="shadow-sm border-t-4 border-t-accent-green">
          <CardHeader className="bg-light-green">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Просроченные задачи
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingKPIs ? (
              <Skeleton className="h-10 w-16" />
            ) : isErrorKPIs ? (
              <div className="text-red-500">Ошибка загрузки</div>
            ) : (
              <div className="text-3xl font-bold text-red-500">{overdueTasksCount}</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render priority badge with appropriate color
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

  // Function to render task status badge
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

  // Function to render "My Tasks" section for non-admin users
  const renderMyTasksSection = () => {
    if (isAdmin) return null;

    return (
      <Card className="mb-6 shadow-sm border-t-4 border-t-accent-green">
        <CardHeader className="bg-light-green">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Мои Задачи</CardTitle>
            <Link 
              to="/tasks" 
              className="text-sm text-accent-green hover:text-accent-green/80 hover:underline"
            >
              Все задачи
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
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
            <div className="text-gray-500 text-center py-4">
              У вас нет активных задач
            </div>
          ) : (
            <ul className="space-y-4">
              {myTasks.map((task: any) => (
                <li key={task.task_id} className="border-b pb-3 last:border-0">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/tasks/${task.task_id}`}
                        className="font-medium hover:text-blue-600 hover:underline"
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
                        <Clock className="h-4 w-4 text-gray-500" />
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

  // Function to render "Team Tasks" section for admin users
  const renderTeamTasksSection = () => {
    if (!isAdmin) return null;

    return (
      <Card className="mb-6 shadow-sm border-t-4 border-t-accent-green">
        <CardHeader className="bg-light-green">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Задачи Команды</CardTitle>
            <Link 
              to="/tasks" 
              className="text-sm text-accent-green hover:text-accent-green/80 hover:underline"
            >
              Все задачи
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoadingAllTasks ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !allTasks || allTasks.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              Нет активных задач
            </div>
          ) : (
            <ul className="space-y-4">
              {allTasks.map((task: any) => (
                <li key={task.task_id} className="border-b pb-3 last:border-0">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/tasks/${task.task_id}`}
                        className="font-medium hover:text-blue-600 hover:underline"
                      >
                        {task.task_name}
                      </Link>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(task.task_status)}
                        {renderPriorityBadge(task.priority)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col xs:flex-row xs:gap-3 text-gray-600">
                        {task.assignedUserName && (
                          <span>
                            Исполнитель: {task.assignedUserName}
                          </span>
                        )}
                        {task.relatedEntityName && (
                          <span>
                            {task.relatedEntityName}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-4 w-4 text-gray-500" />
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

  // Function to render "Recent Activities" section for admin users
  const renderRecentActivitiesSection = () => {
    if (!isAdmin) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Leads */}
        <Card className="shadow-sm border-t-4 border-t-accent-green">
          <CardHeader className="bg-light-green">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Последние Лиды</CardTitle>
              <Link 
                to="/leads" 
                className="text-sm text-accent-green hover:text-accent-green/80 hover:underline"
              >
                Все лиды
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingRecentLeads ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : !recentLeads || recentLeads.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Нет данных о лидах
              </div>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((lead: any) => (
                  <li key={lead.lead_id} className="border-b pb-2 last:border-0">
                    <Link 
                      to={`/leads/${lead.lead_id}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      {lead.name || lead.email || lead.phone || `Лид №${lead.lead_id}`}
                    </Link>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <span>{lead.assignedUser?.full_name || 'Не назначен'}</span>
                      <span>{formatDate(lead.creation_date)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-sm border-t-4 border-t-accent-green">
          <CardHeader className="bg-light-green">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Последние Заказы</CardTitle>
              <Link 
                to="/orders" 
                className="text-sm text-accent-green hover:text-accent-green/80 hover:underline"
              >
                Все заказы
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingRecentOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Нет данных о заказах
              </div>
            ) : (
              <ul className="space-y-3">
                {recentOrders.map((order: any) => (
                  <li key={order.id} className="border-b pb-2 last:border-0">
                    <Link 
                      to={`/orders/${order.id}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      №{order.order_number} - {order.contacts?.full_name || 'Контакт не указан'}
                    </Link>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {order.order_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
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
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="CRM Панель" />
      <Separator className="my-4" />

      {/* KPI Cards */}
      {renderKPICards()}

      {/* Role-based Content */}
      {renderMyTasksSection()}
      {renderTeamTasksSection()}
      {renderRecentActivitiesSection()}
    </div>
  );
};

export default DashboardPage;
