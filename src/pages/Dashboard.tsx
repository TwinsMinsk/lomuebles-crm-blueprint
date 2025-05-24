
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SchemaViewer from "@/components/SchemaViewer";
import KPICardSkeleton from "@/components/ui/skeletons/KPICardSkeleton";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Building2, 
  ShoppingCart, 
  TrendingUp,
  ClipboardList
} from "lucide-react";

const Dashboard = () => {
  const { 
    kpiData, 
    recentTasks, 
    isLoadingKPI, 
    isLoadingTasks 
  } = useDashboardData();

  // Function to get icon component by type
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "users":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "shopping-cart":
        return <ShoppingCart className="h-4 w-4 text-muted-foreground" />;
      case "building2":
        return <Building2 className="h-4 w-4 text-muted-foreground" />;
      case "trending-up":
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
      default:
        return <ClipboardList className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Container>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Панель управления CRM</h1>
        
        {/* KPI Cards Section */}
        <div className="mb-8">
          {isLoadingKPI ? (
            <KPICardSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData?.map((kpi, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {kpi.title}
                    </CardTitle>
                    {getIcon(kpi.iconType)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {kpi.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Последние задачи</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-md">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentTasks && recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task.task_id} className="flex items-center space-x-4 p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{task.task_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.assigned_user_name || 'Не назначен'}
                        </p>
                      </div>
                      <span className="text-sm bg-muted px-2 py-1 rounded">
                        {task.task_status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Задачи не найдены</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>Обзор системы</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600">Добро пожаловать в CRM-систему lomuebles.es.</p>
              <p className="text-gray-600 mt-4">В системе настроены таблицы профилей пользователей, лидов, компаний, контактов, заказов, позиций в заказах, товаров и партнеров-изготовителей с разграничением прав доступа.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle>Статус разработки</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Настроена аутентификация пользователей</li>
                <li>Настроены роли и права доступа</li>
                <li>Создана таблица профилей пользователей</li>
                <li>Настроено автоматическое создание профиля при регистрации</li>
                <li>Создана таблица лидов с разграничением доступа</li>
                <li>Создана таблица компаний с разграничением доступа</li>
                <li>Создана таблица контактов с разграничением доступа</li>
                <li>Создана таблица партнеров-изготовителей с разграничением доступа</li>
                <li>Создана таблица заказов с разграничением доступа</li>
                <li>Настроена автоматическая генерация номеров заказов</li>
                <li>Создана таблица позиций заказа с разграничением доступа</li>
                <li>Создана таблица запросов на изготовление с разграничением доступа</li>
                <li>Создана таблица товаров и шаблонов с разграничением доступа</li>
                <li>Создана таблица поставщиков с разграничением доступа</li>
                <li>Создана таблица задач с разграничением доступа</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Структура базы данных</h2>
          <SchemaViewer />
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
