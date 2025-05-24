
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday, isBefore, subDays } from "date-fns";
import { useAuth } from "@/context/AuthContext";

// Function to fetch new leads count
export const fetchNewLeadsCount = async (userId: string | null, userRole: string | null) => {
  console.log('Fetching new leads count with params:', { userId, userRole });
  try {
    const today = startOfToday();
    const formattedToday = format(today, 'yyyy-MM-dd');

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('creation_date', `${formattedToday}`);

    // Filter by assigned user if not admin
    if (userRole !== 'Главный Администратор' && userRole !== 'Администратор' && userId) {
      query = query.eq('assigned_user_id', userId);
    }

    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching new leads count: ${error.message}`);
    }
    
    console.log('New leads count result:', count);
    return count || 0;
  } catch (error) {
    console.error('Error in fetchNewLeadsCount:', error);
    throw error;
  }
};

// Function to fetch active orders count
export const fetchActiveOrdersCount = async (userId: string | null, userRole: string | null) => {
  console.log('Fetching active orders count with params:', { userId, userRole });
  try {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('status', 'eq', 'Отменен')
      .not('status', 'eq', 'Завершен');
    
    // Filter by assigned user if not admin
    if (userRole !== 'Главный Администратор' && userRole !== 'Администратор' && userId) {
      query = query.eq('assigned_user_id', userId);
    }

    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching active orders count: ${error.message}`);
    }
    
    console.log('Active orders count result:', count);
    return count || 0;
  } catch (error) {
    console.error('Error in fetchActiveOrdersCount:', error);
    throw error;
  }
};

// Function to fetch today's tasks count
export const fetchTodaysTasksCount = async (userId: string | null, userRole: string | null) => {
  console.log('Fetching today\'s tasks count with params:', { userId, userRole });
  try {
    // Use client-side date calculation for today's date range
    const today = startOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates in ISO format for proper timezone handling
    const todayISO = today.toISOString();
    const tomorrowISO = tomorrow.toISOString();
    
    console.log('Date range for today\'s tasks:', { todayISO, tomorrowISO });

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .gte('due_date', todayISO)
      .lt('due_date', tomorrowISO)
      .not('task_status', 'eq', 'Выполнена')
      .not('task_status', 'eq', 'Отменена');

    // Filter by assigned user if not admin
    if (userRole !== 'Главный Администратор' && userRole !== 'Администратор' && userId) {
      query = query.eq('assigned_task_user_id', userId);
    }

    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching today's tasks count: ${error.message}`);
    }
    
    console.log('Today\'s tasks count result:', count);
    return count || 0;
  } catch (error) {
    console.error('Error in fetchTodaysTasksCount:', error);
    throw error;
  }
};

// Function to fetch overdue tasks count
export const fetchOverdueTasksCount = async (userId: string | null, userRole: string | null) => {
  console.log('Fetching overdue tasks count with params:', { userId, userRole });
  try {
    const today = startOfToday();
    const todayISO = today.toISOString();
    
    console.log('Overdue tasks cutoff date:', todayISO);

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', todayISO)
      .not('task_status', 'eq', 'Выполнена')
      .not('task_status', 'eq', 'Отменена');

    // Filter by assigned user if not admin
    if (userRole !== 'Главный Администратор' && userRole !== 'Администратор' && userId) {
      query = query.eq('assigned_task_user_id', userId);
    }

    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching overdue tasks count: ${error.message}`);
    }
    
    console.log('Overdue tasks count result:', count);
    return count || 0;
  } catch (error) {
    console.error('Error in fetchOverdueTasksCount:', error);
    throw error;
  }
};

// Function to fetch tasks assigned to current user
export const fetchMyTasks = async (userId: string | null) => {
  console.log('Fetching tasks for user:', userId);
  try {
    if (!userId) return [];
    
    // First, get the task data
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles!tasks_assigned_task_user_id_fkey(full_name)
      `)
      .eq('assigned_task_user_id', userId)
      .not('task_status', 'eq', 'Выполнена')
      .not('task_status', 'eq', 'Отменена')
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Error fetching my tasks: ${error.message}`);
    }

    // Now process and enhance the tasks with related entity information
    const enhancedTasks = await Promise.all(data.map(async (task) => {
      const now = new Date();
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      const isOverdue = dueDate ? isBefore(dueDate, now) : false;
      
      // Default entity information
      let relatedEntityName = null;
      
      // If task is related to an order, fetch order details (updated to use orders table)
      if (task.related_order_id) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('order_number, order_name')
          .eq('id', task.related_order_id)
          .single();
        
        relatedEntityName = orderData 
          ? `Заказ #${orderData.order_number}` 
          : `Заказ #${task.related_order_id}`;
      }
      // If task is related to a lead, fetch lead details
      else if (task.related_lead_id) {
        const { data: leadData } = await supabase
          .from('leads')
          .select('name')
          .eq('lead_id', task.related_lead_id)
          .single();
        
        relatedEntityName = `Лид: ${leadData?.name || 'Без имени'}`;
      }
      // If task is related to a contact, fetch contact details
      else if (task.related_contact_id) {
        const { data: contactData } = await supabase
          .from('contacts')
          .select('full_name')
          .eq('contact_id', task.related_contact_id)
          .single();
        
        relatedEntityName = `Контакт: ${contactData?.full_name || 'Без имени'}`;
      }
      
      return {
        ...task,
        isOverdue,
        relatedEntityName
      };
    }));
    
    console.log('Enhanced tasks:', enhancedTasks.length);
    return enhancedTasks;
  } catch (error) {
    console.error('Error in fetchMyTasks:', error);
    throw error;
  }
};

// Function to fetch all tasks (for admin view)
export const fetchAllTasks = async (filters: any = {}) => {
  console.log('Fetching all tasks with filters:', filters);
  try {
    // First, get the task data
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles!tasks_assigned_task_user_id_fkey(id, full_name)
      `)
      .not('task_status', 'eq', 'Выполнена')
      .not('task_status', 'eq', 'Отменена')
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Error fetching all tasks: ${error.message}`);
    }

    // Now process and enhance the tasks with related entity information
    const enhancedTasks = await Promise.all(data.map(async (task) => {
      const now = new Date();
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      const isOverdue = dueDate ? isBefore(dueDate, now) : false;
      
      // Default entity information
      let relatedEntityName = null;
      
      // If task is related to an order, fetch order details (updated to use orders table)
      if (task.related_order_id) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('order_number, order_name')
          .eq('id', task.related_order_id)
          .single();
        
        relatedEntityName = orderData 
          ? `Заказ #${orderData.order_number}` 
          : `Заказ #${task.related_order_id}`;
      }
      // If task is related to a lead, fetch lead details
      else if (task.related_lead_id) {
        const { data: leadData } = await supabase
          .from('leads')
          .select('name')
          .eq('lead_id', task.related_lead_id)
          .single();
        
        relatedEntityName = `Лид: ${leadData?.name || 'Без имени'}`;
      }
      // If task is related to a contact, fetch contact details
      else if (task.related_contact_id) {
        const { data: contactData } = await supabase
          .from('contacts')
          .select('full_name')
          .eq('contact_id', task.related_contact_id)
          .single();
        
        relatedEntityName = `Контакт: ${contactData?.full_name || 'Без имени'}`;
      }
      
      return {
        ...task,
        isOverdue,
        assignedUserName: task.profiles?.full_name,
        relatedEntityName
      };
    }));
    
    console.log('All tasks count:', enhancedTasks.length);
    return enhancedTasks;
  } catch (error) {
    console.error('Error in fetchAllTasks:', error);
    throw error;
  }
};

// Function to fetch recent leads
export const fetchRecentLeads = async () => {
  console.log('Fetching recent leads');
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assignedUser:profiles!leads_assigned_user_id_fkey(full_name),
        creatorUser:profiles!leads_creator_user_id_fkey(full_name)
      `)
      .order('creation_date', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Error fetching recent leads: ${error.message}`);
    }

    console.log('Recent leads count:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('Error in fetchRecentLeads:', error);
    throw error;
  }
};

// Function to fetch recent orders
export const fetchRecentOrders = async () => {
  console.log('Fetching recent orders');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        contacts!orders_client_contact_id_fkey(full_name),
        assignedUser:profiles!orders_assigned_user_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Error fetching recent orders: ${error.message}`);
    }

    console.log('Recent orders count:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('Error in fetchRecentOrders:', error);
    throw error;
  }
};

// Dashboard KPIs hook
export const useDashboardKPIs = () => {
  const { user, userRole } = useAuth();
  const userId = user?.id || null;

  const newLeadsQuery = useQuery({
    queryKey: ['dashboard', 'newLeads', userId, userRole],
    queryFn: () => fetchNewLeadsCount(userId, userRole),
    meta: {
      onError: (error: Error) => {
        console.error('Error in newLeadsQuery:', error);
      }
    }
  });

  const activeOrdersQuery = useQuery({
    queryKey: ['dashboard', 'activeOrders', userId, userRole],
    queryFn: () => fetchActiveOrdersCount(userId, userRole),
    meta: {
      onError: (error: Error) => {
        console.error('Error in activeOrdersQuery:', error);
      }
    }
  });

  const todaysTasksQuery = useQuery({
    queryKey: ['dashboard', 'todaysTasks', userId, userRole],
    queryFn: () => fetchTodaysTasksCount(userId, userRole),
    meta: {
      onError: (error: Error) => {
        console.error('Error in todaysTasksQuery:', error);
      }
    }
  });

  const overdueTasksQuery = useQuery({
    queryKey: ['dashboard', 'overdueTasks', userId, userRole],
    queryFn: () => fetchOverdueTasksCount(userId, userRole),
    meta: {
      onError: (error: Error) => {
        console.error('Error in overdueTasksQuery:', error);
      }
    }
  });

  return {
    newLeadsCount: newLeadsQuery.data || 0,
    activeOrdersCount: activeOrdersQuery.data || 0,
    todaysTasksCount: todaysTasksQuery.data || 0,
    overdueTasksCount: overdueTasksQuery.data || 0,
    isLoading: 
      newLeadsQuery.isPending || 
      activeOrdersQuery.isPending || 
      todaysTasksQuery.isPending || 
      overdueTasksQuery.isPending,
    isError:
      newLeadsQuery.isError ||
      activeOrdersQuery.isError ||
      todaysTasksQuery.isError ||
      overdueTasksQuery.isError,
  };
};

// My Tasks hook
export const useMyTasks = () => {
  const { user } = useAuth();
  const userId = user?.id || null;

  return useQuery({
    queryKey: ['dashboard', 'myTasks', userId],
    queryFn: () => fetchMyTasks(userId),
    enabled: !!userId,
    meta: {
      onError: (error: Error) => {
        console.error('Error in useMyTasks:', error);
      }
    }
  });
};

// All Tasks hook (for admin view)
export const useAllTasks = (filters: any = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'allTasks', filters],
    queryFn: () => fetchAllTasks(filters),
    meta: {
      onError: (error: Error) => {
        console.error('Error in useAllTasks:', error);
      }
    }
  });
};

// Recent Leads hook
export const useRecentLeads = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentLeads'],
    queryFn: fetchRecentLeads,
    meta: {
      onError: (error: Error) => {
        console.error('Error in useRecentLeads:', error);
      }
    }
  });
};

// Recent Orders hook
export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders'],
    queryFn: fetchRecentOrders,
    meta: {
      onError: (error: Error) => {
        console.error('Error in useRecentOrders:', error);
      }
    }
  });
};
