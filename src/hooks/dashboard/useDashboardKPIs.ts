
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useDashboardKPIs = () => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  const isSpecialist = userRole === 'Замерщик' || userRole === 'Дизайнер' || userRole === 'Монтажник';

  return useQuery({
    queryKey: ['dashboard-kpis', userRole, user?.id],
    queryFn: async () => {
      console.log('useDashboardKPIs: User role:', userRole);
      console.log('useDashboardKPIs: User ID:', user?.id);
      console.log('useDashboardKPIs: Is admin:', isAdmin);
      console.log('useDashboardKPIs: Is specialist:', isSpecialist);

      const today = new Date().toISOString().split('T')[0];
      console.log('useDashboardKPIs: Today date:', today);
      
      // Get new leads count for today (only for admins)
      let newLeadsCount = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('creation_date', today);
        newLeadsCount = count || 0;
      }

      // Define active statuses for both order types (only for admins)
      let activeOrdersCount = 0;
      if (isAdmin) {
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
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', allActiveStatuses);

        activeOrdersCount = count || 0;
      }

      // Build today's tasks query with role-based filtering
      let todaysTasksQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('due_date', today);

      // Filter by assigned user for specialists
      if (isSpecialist && user?.id) {
        console.log('useDashboardKPIs: Filtering today tasks for specialist:', user.id);
        todaysTasksQuery = todaysTasksQuery.eq('assigned_task_user_id', user.id);
      }

      const { count: todaysTasksCount, error: todaysError } = await todaysTasksQuery;
      if (todaysError) {
        console.error('useDashboardKPIs: Error fetching today tasks:', todaysError);
      }
      console.log('useDashboardKPIs: Today tasks count:', todaysTasksCount);

      // Build overdue tasks query with role-based filtering
      let overdueTasksQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', today)
        .neq('task_status', 'Выполнена');

      // Filter by assigned user for specialists
      if (isSpecialist && user?.id) {
        console.log('useDashboardKPIs: Filtering overdue tasks for specialist:', user.id);
        overdueTasksQuery = overdueTasksQuery.eq('assigned_task_user_id', user.id);
      }

      const { count: overdueTasksCount, error: overdueError } = await overdueTasksQuery;
      if (overdueError) {
        console.error('useDashboardKPIs: Error fetching overdue tasks:', overdueError);
      }
      console.log('useDashboardKPIs: Overdue tasks count:', overdueTasksCount);

      const result = {
        newLeadsCount: newLeadsCount || 0,
        activeOrdersCount: activeOrdersCount || 0,
        todaysTasksCount: todaysTasksCount || 0,
        overdueTasksCount: overdueTasksCount || 0,
      };

      console.log('useDashboardKPIs: Final result:', result);
      return result;
    },
    enabled: !!userRole && !!user,
  });
};
