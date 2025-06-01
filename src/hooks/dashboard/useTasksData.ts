
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

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
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

  return useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async (): Promise<TaskData[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          task_id,
          task_name,
          task_status,
          priority,
          due_date
        `)
        .eq('assigned_task_user_id', user.id)
        .neq('task_status', 'Выполнена')
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      return (data || []).map(task => ({
        ...task,
        isOverdue: task.due_date ? task.due_date < today : false,
        relatedEntityName: '', // Will be populated separately if needed
      }));
    },
    enabled: !!user?.id && !isAdmin,
  });
};

export const useAllTasks = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

  return useQuery({
    queryKey: ['all-tasks'],
    queryFn: async (): Promise<TaskData[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          task_id,
          task_name,
          task_status,
          priority,
          due_date,
          assigned_task_user_id
        `)
        .neq('task_status', 'Выполнена')
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Get user names for assigned users
      const userIds = [...new Set((data || []).map(task => task.assigned_task_user_id).filter(Boolean))];
      
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

      const today = new Date().toISOString().split('T')[0];
      
      return (data || []).map(task => ({
        ...task,
        assignedUserName: userNames[task.assigned_task_user_id] || 'Не назначен',
        isOverdue: task.due_date ? task.due_date < today : false,
        relatedEntityName: '', // Will be populated separately if needed
      }));
    },
    enabled: isAdmin,
  });
};
