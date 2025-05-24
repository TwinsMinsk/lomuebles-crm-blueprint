
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building2, 
  ShoppingCart, 
  TrendingUp,
  ClipboardList
} from "lucide-react";

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
          icon: <Users className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: "Активные заказы",
          value: "89",
          description: "+3% за неделю",
          icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: "Контакты",
          value: "156",
          description: "+8% за месяц",
          icon: <Building2 className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: "Конверсия",
          value: "12.5%",
          description: "+2.1% за месяц",
          icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
