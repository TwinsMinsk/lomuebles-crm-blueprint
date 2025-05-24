
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useDashboardData() {
  // Mock KPI data query - replace with real data fetching
  const { data: kpiData, isLoading: isLoadingKPI } = useQuery({
    queryKey: ["dashboard-kpi"],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          title: "Всего лидов",
          value: "247",
          description: "+12% за месяц",
          iconType: "users"
        },
        {
          title: "Активные заказы",
          value: "89",
          description: "+3% за неделю",
          iconType: "shopping-cart"
        },
        {
          title: "Контакты",
          value: "156",
          description: "+8% за месяц",
          iconType: "building2"
        },
        {
          title: "Конверсия",
          value: "12.5%",
          description: "+2.1% за месяц",
          iconType: "trending-up"
        }
      ];
    },
  });

  // Recent tasks query
  const { data: recentTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["dashboard-recent-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          task_id,
          task_name,
          task_status,
          due_date,
          profiles!tasks_assigned_task_user_id_fkey(full_name)
        `)
        .order("creation_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return data.map(task => ({
        ...task,
        assigned_user_name: task.profiles?.full_name || null
      }));
    },
  });

  return {
    kpiData,
    recentTasks,
    isLoadingKPI,
    isLoadingTasks,
  };
}

// KPI Dashboard hook
export function useDashboardKPIs() {
  const { data: kpis, isLoading, isError } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get new leads count for today
      const { data: newLeads } = await supabase
        .from("leads")
        .select("lead_id")
        .gte("creation_date", today);

      // Get active orders count
      const { data: activeOrders } = await supabase
        .from("orders")
        .select("id")
        .in("status", ["Новый", "В работе", "Подтвержден", "В производстве"]);

      // Get today's tasks count
      const { data: todaysTasks } = await supabase
        .from("tasks")
        .select("task_id")
        .eq("due_date::date", today);

      // Get overdue tasks count
      const { data: overdueTasks } = await supabase
        .from("tasks")
        .select("task_id")
        .lt("due_date", today)
        .neq("task_status", "Выполнена");

      return {
        newLeadsCount: newLeads?.length || 0,
        activeOrdersCount: activeOrders?.length || 0,
        todaysTasksCount: todaysTasks?.length || 0,
        overdueTasksCount: overdueTasks?.length || 0,
      };
    },
  });

  return {
    newLeadsCount: kpis?.newLeadsCount || 0,
    activeOrdersCount: kpis?.activeOrdersCount || 0,
    todaysTasksCount: kpis?.todaysTasksCount || 0,
    overdueTasksCount: kpis?.overdueTasksCount || 0,
    isLoading,
    isError,
  };
}

// My Tasks hook
export function useMyTasks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          task_id,
          task_name,
          task_status,
          due_date,
          priority,
          related_order_id,
          related_contact_id,
          related_lead_id,
          orders(order_number),
          contacts(full_name),
          leads(name, email, phone)
        `)
        .eq("assigned_task_user_id", user.id)
        .neq("task_status", "Выполнена")
        .order("due_date", { ascending: true })
        .limit(10);

      if (error) throw error;

      return data?.map(task => ({
        ...task,
        isOverdue: task.due_date && new Date(task.due_date) < new Date(),
        relatedEntityName: task.orders?.order_number || task.contacts?.full_name || task.leads?.name || task.leads?.email || task.leads?.phone || null
      })) || [];
    },
    enabled: !!user?.id,
  });
}

// All Tasks hook (for admins)
export function useAllTasks() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  
  return useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          task_id,
          task_name,
          task_status,
          due_date,
          priority,
          related_order_id,
          related_contact_id,
          related_lead_id,
          profiles!tasks_assigned_task_user_id_fkey(full_name),
          orders(order_number),
          contacts(full_name),
          leads(name, email, phone)
        `)
        .neq("task_status", "Выполнена")
        .order("due_date", { ascending: true })
        .limit(10);

      if (error) throw error;

      return data?.map(task => ({
        ...task,
        assignedUserName: task.profiles?.full_name,
        isOverdue: task.due_date && new Date(task.due_date) < new Date(),
        relatedEntityName: task.orders?.order_number || task.contacts?.full_name || task.leads?.name || task.leads?.email || task.leads?.phone || null
      })) || [];
    },
    enabled: isAdmin,
  });
}

// Recent Leads hook
export function useRecentLeads() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  
  return useQuery({
    queryKey: ["recent-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          lead_id,
          name,
          email,
          phone,
          creation_date,
          profiles!leads_assigned_user_id_fkey(full_name)
        `)
        .order("creation_date", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.map(lead => ({
        ...lead,
        assignedUser: lead.profiles
      })) || [];
    },
    enabled: isAdmin,
  });
}

// Recent Orders hook
export function useRecentOrders() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  
  return useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          order_type,
          status,
          created_at,
          contacts(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data || [];
    },
    enabled: isAdmin,
  });
}
