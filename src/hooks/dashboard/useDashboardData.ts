
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday, isBefore } from "date-fns";
import { useAuth } from "@/context/AuthContext";

// Function to fetch new leads count
export const fetchNewLeadsCount = async (userId: string | null, userRole: string | null) => {
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
  
  return count || 0;
};

// Function to fetch active orders count
export const fetchActiveOrdersCount = async (userId: string | null, userRole: string | null) => {
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
  
  return count || 0;
};

// Function to fetch today's tasks count
export const fetchTodaysTasksCount = async (userId: string | null, userRole: string | null) => {
  const today = startOfToday();
  const endOfDayToday = endOfToday();
  const formattedToday = format(today, 'yyyy-MM-dd');
  const formattedEndOfDay = format(endOfDayToday, "yyyy-MM-dd'T'HH:mm:ss");

  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .gte('due_date', `${formattedToday}`)
    .lte('due_date', `${formattedEndOfDay}`)
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
  
  return count || 0;
};

// Function to fetch overdue tasks count
export const fetchOverdueTasksCount = async (userId: string | null, userRole: string | null) => {
  const today = startOfToday();
  const formattedToday = format(today, 'yyyy-MM-dd');

  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .lt('due_date', `${formattedToday}`)
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
  
  return count || 0;
};

// Function to fetch tasks assigned to current user
export const fetchMyTasks = async (userId: string | null) => {
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
    
    // If task is related to an order, fetch order details
    if (task.related_deal_order_id) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('order_number, order_name')
        .eq('id', task.related_deal_order_id)
        .single();
      
      relatedEntityName = orderData 
        ? `Заказ #${orderData.order_number}` 
        : `Заказ #${task.related_deal_order_id}`;
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
  
  return enhancedTasks;
};

// Function to fetch all tasks (for admin view)
export const fetchAllTasks = async (filters: any = {}) => {
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
    
    // If task is related to an order, fetch order details
    if (task.related_deal_order_id) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('order_number, order_name')
        .eq('id', task.related_deal_order_id)
        .single();
      
      relatedEntityName = orderData 
        ? `Заказ #${orderData.order_number}` 
        : `Заказ #${task.related_deal_order_id}`;
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
  
  return enhancedTasks;
};

// Function to fetch recent leads
export const fetchRecentLeads = async () => {
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

  return data;
};

// Function to fetch recent orders
export const fetchRecentOrders = async () => {
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

  return data;
};

// Dashboard KPIs hook
export const useDashboardKPIs = () => {
  const { user, userRole } = useAuth();
  const userId = user?.id || null;

  const newLeadsQuery = useQuery({
    queryKey: ['dashboard', 'newLeads', userId, userRole],
    queryFn: () => fetchNewLeadsCount(userId, userRole),
  });

  const activeOrdersQuery = useQuery({
    queryKey: ['dashboard', 'activeOrders', userId, userRole],
    queryFn: () => fetchActiveOrdersCount(userId, userRole),
  });

  const todaysTasksQuery = useQuery({
    queryKey: ['dashboard', 'todaysTasks', userId, userRole],
    queryFn: () => fetchTodaysTasksCount(userId, userRole),
  });

  const overdueTasksQuery = useQuery({
    queryKey: ['dashboard', 'overdueTasks', userId, userRole],
    queryFn: () => fetchOverdueTasksCount(userId, userRole),
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
  });
};

// All Tasks hook (for admin view)
export const useAllTasks = (filters: any = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'allTasks', filters],
    queryFn: () => fetchAllTasks(filters),
  });
};

// Recent Leads hook
export const useRecentLeads = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentLeads'],
    queryFn: fetchRecentLeads,
  });
};

// Recent Orders hook
export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders'],
    queryFn: fetchRecentOrders,
  });
};
