
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useDashboardKPIs = () => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  const isSpecialist = userRole && !isAdmin;

  return useQuery({
    queryKey: ['dashboard-kpis', userRole, user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get new leads count for today
      const { count: newLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('creation_date', today);

      // Define active statuses for both order types
      const activeReadyMadeStatuses = [
        'Новый', 
        'Ожидает подтверждения', 
        'Ожидает оплаты', 
        'Оплачен', 
        'Передан на сборку', 
        'Готов к отгрузке', 
        'В доставке'
      ];
      
      const activeCustomMadeStatuses = [
        'Новый запрос',
        'Предварительная оценка',
        'Согласование ТЗ/Дизайна',
        'Ожидает замера',
        'Замер выполнен',
        'Проектирование',
        'Согласование проекта',
        'Ожидает предоплаты',
        'В производстве',
        'Готов к монтажу',
        'Монтаж'
      ];

      // Combine all active statuses
      const allActiveStatuses = [...activeReadyMadeStatuses, ...activeCustomMadeStatuses];

      // Get active orders count (excluding completed/cancelled orders)
      const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', allActiveStatuses);

      // Build today's tasks query with role-based filtering
      let todaysTasksQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('due_date', today);

      // Filter by assigned user for specialists
      if (isSpecialist && user?.id) {
        todaysTasksQuery = todaysTasksQuery.eq('assigned_task_user_id', user.id);
      }

      const { count: todaysTasksCount } = await todaysTasksQuery;

      // Build overdue tasks query with role-based filtering
      let overdueTasksQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', today)
        .neq('task_status', 'Выполнена');

      // Filter by assigned user for specialists
      if (isSpecialist && user?.id) {
        overdueTasksQuery = overdueTasksQuery.eq('assigned_task_user_id', user.id);
      }

      const { count: overdueTasksCount } = await overdueTasksQuery;

      return {
        newLeadsCount: newLeadsCount || 0,
        activeOrdersCount: activeOrdersCount || 0,
        todaysTasksCount: todaysTasksCount || 0,
        overdueTasksCount: overdueTasksCount || 0,
      };
    },
    enabled: !!userRole && !!user,
  });
};
