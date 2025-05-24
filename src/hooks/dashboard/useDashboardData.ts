
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
      
      return data?.map(task => ({
        ...task,
        assigned_user_name: task.profiles?.full_name || null
      })) || [];
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
          related_lead_id
        `)
        .eq("assigned_task_user_id", user.id)
        .neq("task_status", "Выполнена")
        .order("due_date", { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch related entities separately to avoid deep type inference
      const tasksWithRelated = await Promise.all((data || []).map(async (task) => {
        let relatedEntityName = null;
        
        if (task.related_order_id) {
          const { data: order } = await supabase
            .from("orders")
            .select("order_number")
            .eq("id", task.related_order_id)
            .single();
          relatedEntityName = order?.order_number;
        } else if (task.related_contact_id) {
          const { data: contact } = await supabase
            .from("contacts")
            .select("full_name")
            .eq("contact_id", task.related_contact_id)
            .single();
          relatedEntityName = contact?.full_name;
        } else if (task.related_lead_id) {
          const { data: lead } = await supabase
            .from("leads")
            .select("name, email, phone")
            .eq("lead_id", task.related_lead_id)
            .single();
          relatedEntityName = lead?.name || lead?.email || lead?.phone;
        }

        return {
          ...task,
          isOverdue: task.due_date && new Date(task.due_date) < new Date(),
          relatedEntityName
        };
      }));

      return tasksWithRelated;
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
          assigned_task_user_id
        `)
        .neq("task_status", "Выполнена")
        .order("due_date", { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch related entities and assigned user separately
      const tasksWithRelated = await Promise.all((data || []).map(async (task) => {
        let relatedEntityName = null;
        let assignedUserName = null;
        
        // Get assigned user name
        if (task.assigned_task_user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", task.assigned_task_user_id)
            .single();
          assignedUserName = profile?.full_name;
        }

        // Get related entity name
        if (task.related_order_id) {
          const { data: order } = await supabase
            .from("orders")
            .select("order_number")
            .eq("id", task.related_order_id)
            .single();
          relatedEntityName = order?.order_number;
        } else if (task.related_contact_id) {
          const { data: contact } = await supabase
            .from("contacts")
            .select("full_name")
            .eq("contact_id", task.related_contact_id)
            .single();
          relatedEntityName = contact?.full_name;
        } else if (task.related_lead_id) {
          const { data: lead } = await supabase
            .from("leads")
            .select("name, email, phone")
            .eq("lead_id", task.related_lead_id)
            .single();
          relatedEntityName = lead?.name || lead?.email || lead?.phone;
        }

        return {
          ...task,
          assignedUserName,
          isOverdue: task.due_date && new Date(task.due_date) < new Date(),
          relatedEntityName
        };
      }));

      return tasksWithRelated;
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
          assigned_user_id
        `)
        .order("creation_date", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch assigned users separately
      const leadsWithUsers = await Promise.all((data || []).map(async (lead) => {
        let assignedUser = null;
        
        if (lead.assigned_user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", lead.assigned_user_id)
            .single();
          assignedUser = profile;
        }

        return {
          ...lead,
          assignedUser
        };
      }));

      return leadsWithUsers;
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
          client_contact_id
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch contact names separately
      const ordersWithContacts = await Promise.all((data || []).map(async (order) => {
        let contactName = null;
        
        if (order.client_contact_id) {
          const { data: contact } = await supabase
            .from("contacts")
            .select("full_name")
            .eq("contact_id", order.client_contact_id)
            .single();
          contactName = contact?.full_name;
        }

        return {
          ...order,
          contacts: contactName ? { full_name: contactName } : null
        };
      }));

      return ordersWithContacts;
    },
    enabled: isAdmin,
  });
}
