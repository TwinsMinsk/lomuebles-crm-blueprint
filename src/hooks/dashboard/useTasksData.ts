
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getTodayInMadrid } from "@/utils/timezone";

interface TaskData {
  task_id: number;
  task_name: string;
  task_status: string;
  priority?: string;
  due_date?: string;
  assignedUserName?: string;
  relatedEntityName?: string;
  isOverdue: boolean;
}

export const useMyTasks = () => {
  const { user, userRole } = useAuth();
  const isSpecialist = userRole === 'Замерщик' || userRole === 'Дизайнер' || userRole === 'Монтажник' || userRole === 'Специалист';

  return useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async (): Promise<TaskData[]> => {
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
        .order('due_date', { ascending: true, nullsFirst: false })
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
    queryFn: async (): Promise<TaskData[]> => {
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
        .order('due_date', { ascending: true, nullsFirst: false })
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
