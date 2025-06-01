// Re-export all dashboard hooks from their new locations
export { useDashboardKPIs } from './useDashboardKPIs';
export { useMyTasks, useAllTasks } from './useTasksData';
export { useRecentLeads, useRecentOrders } from './useRecentData';

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getTodayInMadrid, getMadridDayBoundaries } from "@/utils/timezone";

export const useDashboardKPIs = () => {
  const { userRole, user } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  const isSpecialist = userRole === 'Замерщик' || userRole === 'Дизайнер' || userRole === 'Монтажник' || userRole === 'Специалист';
  
  console.log('useDashboardKPIs: User role:', userRole);
  console.log('useDashboardKPIs: User ID:', user?.id);
  console.log('useDashboardKPIs: Is admin:', isAdmin);
  console.log('useDashboardKPIs: Is specialist:', isSpecialist);

  return useQuery({
    queryKey: ['dashboard-kpis', userRole, user?.id],
    queryFn: async () => {
      if (!isAdmin) {
        console.log('useDashboardKPIs: Not admin, returning empty data');
        return null;
      }

      // Get today's boundaries in Madrid timezone
      const todayBoundaries = getTodayInMadrid();
      
      // Convert to ISO strings for database queries
      const todayStart = todayBoundaries.start.toISOString();
      const todayEnd = todayBoundaries.end.toISOString();
      
      console.log('useDashboardKPIs: Today boundaries in Madrid:', {
        start: todayStart,
        end: todayEnd
      });

      try {
        // Count new leads created today (in Madrid time)
        const { data: newLeads, error: leadsError } = await supabase
          .from('leads')
          .select('lead_id', { count: 'exact' })
          .gte('creation_date', todayStart)
          .lte('creation_date', todayEnd);

        if (leadsError) throw leadsError;

        // Count active orders
        const { data: activeOrders, error: ordersError } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .in('status', ['Новый', 'В работе']);

        if (ordersError) throw ordersError;

        // Count today's tasks (due date is in Madrid timezone)
        const { data: todaysTasks, error: todaysTasksError } = await supabase
          .from('tasks')
          .select('task_id', { count: 'exact' })
          .gte('due_date', todayStart)
          .lte('due_date', todayEnd)
          .neq('task_status', 'Выполнена')
          .neq('task_status', 'Отменена');

        if (todaysTasksError) throw todaysTasksError;

        console.log('useDashboardKPIs: Today tasks count:', todaysTasks?.length || 0);

        // Count overdue tasks (due before today in Madrid timezone)
        const { data: overdueTasks, error: overdueTasksError } = await supabase
          .from('tasks')
          .select('task_id', { count: 'exact' })
          .lt('due_date', todayStart)
          .neq('task_status', 'Выполнена')
          .neq('task_status', 'Отменена');

        if (overdueTasksError) throw overdueTasksError;

        console.log('useDashboardKPIs: Overdue tasks count:', overdueTasks?.length || 0);

        const result = {
          newLeadsCount: newLeads?.length || 0,
          activeOrdersCount: activeOrders?.length || 0,
          todaysTasksCount: todaysTasks?.length || 0,
          overdueTasksCount: overdueTasks?.length || 0,
        };

        console.log('useDashboardKPIs: Final result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching dashboard KPIs:', error);
        throw error;
      }
    },
    enabled: isAdmin,
  });
};

export const useMyTasks = () => {
  const { user, userRole } = useAuth();
  const isSpecialist = userRole === 'Замерщик' || userRole === 'Дизайнер' || userRole === 'Монтажник' || userRole === 'Специалист';

  return useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      if (!user || !isSpecialist) return [];

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          task_id,
          task_name,
          task_status,
          priority,
          due_date,
          related_order_id,
          related_contact_id,
          related_lead_id
        `)
        .eq('assigned_task_user_id', user.id)
        .neq('task_status', 'Выполнена')
        .neq('task_status', 'Отменена')
        .order('due_date', { ascending: true, nullsLast: true })
        .limit(10);

      if (error) throw error;

      // Get today's boundaries in Madrid timezone for overdue calculation
      const todayBoundaries = getTodayInMadrid();
      const todayStart = todayBoundaries.start;

      return (tasks || []).map((task: any) => {
        const isOverdue = task.due_date && new Date(task.due_date) < todayStart;
        
        return {
          ...task,
          isOverdue,
          relatedEntityName: task.related_order_id 
            ? `Заказ #${task.related_order_id}`
            : task.related_contact_id 
            ? `Контакт #${task.related_contact_id}`
            : task.related_lead_id 
            ? `Лид #${task.related_lead_id}`
            : null
        };
      });
    },
    enabled: !!user && isSpecialist,
  });
};

export const useAllTasks = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

  return useQuery({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      if (!isAdmin) return [];

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          task_id,
          task_name,
          task_status,
          priority,
          due_date,
          assigned_task_user_id,
          related_order_id,
          related_contact_id,
          related_lead_id
        `)
        .neq('task_status', 'Выполнена')
        .neq('task_status', 'Отменена')
        .order('due_date', { ascending: true, nullsLast: true })
        .limit(10);

      if (error) throw error;

      // Get user names for assigned users
      const userIds = [...new Set(tasks?.map(task => task.assigned_task_user_id).filter(Boolean))];
      
      let userNames: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        if (profiles) {
          userNames = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile.full_name || 'Не указано';
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Get today's boundaries in Madrid timezone for overdue calculation
      const todayBoundaries = getTodayInMadrid();
      const todayStart = todayBoundaries.start;

      return (tasks || []).map((task: any) => {
        const isOverdue = task.due_date && new Date(task.due_date) < todayStart;
        
        return {
          ...task,
          isOverdue,
          assignedUserName: task.assigned_task_user_id ? userNames[task.assigned_task_user_id] || 'Не назначен' : 'Не назначен'
        };
      });
    },
    enabled: isAdmin,
  });
};
