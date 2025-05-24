
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
          assignedUser:assigned_task_user_id(full_name)
        `)
        .neq('task_status', 'Выполнена')
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      return (data || []).map(task => ({
        ...task,
        assignedUserName: task.assignedUser?.full_name || 'Не назначен',
        isOverdue: task.due_date ? task.due_date < today : false,
        relatedEntityName: '', // Will be populated separately if needed
      }));
    },
    enabled: isAdmin,
  });
};
