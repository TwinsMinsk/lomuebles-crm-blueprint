
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useDashboardKPIs = () => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  const isSpecialist = userRole === 'Специалист';

  return useQuery({
    queryKey: ['dashboard-kpis', userRole, user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get new leads count for today (only for admins)
      let newLeadsCount = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('creation_date', today);
        newLeadsCount = count || 0;
      }

      // Get active orders count (only for admins)
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

        const allActiveStatuses = [...activeReadyMadeStatuses, ...activeCustomMadeStatuses];

        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', allActiveStatuses);
        activeOrdersCount = count || 0;
      }

      // Get today's tasks count - filtered by user for specialists
      let todaysTasksQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('due_date', today);

      if (isSpecialist && user?.id) {
        todaysTasksQuery = todaysTasksQuery.eq('assigned_task_user_id', user.id);
      }

      const { count: todaysTasksCount } = await todaysTasksQuery;

      // Get overdue tasks count - filtered by user for specialists
      let overdueTasksQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', today)
        .neq('task_status', 'Завершена');

      if (isSpecialist && user?.id) {
        overdueTasksQuery = overdueTasksQuery.eq('assigned_task_user_id', user.id);
      }

      const { count: overdueTasksCount } = await overdueTasksQuery;

      return {
        newLeadsCount,
        activeOrdersCount,
        todaysTasksCount: todaysTasksCount || 0,
        overdueTasksCount: overdueTasksCount || 0,
      };
    },
    enabled: !!userRole && !!user,
  });
};
