
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTasks } from "@/hooks/useTasks";
import { TaskFiltersType } from "@/types/task";
import { useAuth } from "@/context/AuthContext";

export function useTasksState() {
  // State
  const [currentPage, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>("task_status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: null,
    taskStatus: null,
    taskType: null,
    priority: null,
    assignedToMe: false,
    createdByMe: false,
    viewType: "my",
    assignedUserId: null,
    dueDateFrom: null,
    dueDateTo: null,
    dueDateRange: null,
  });

  const { user, userRole } = useAuth();
  const { fetchTasks, totalCount } = useTasks();

  // Set default filters based on user role
  useEffect(() => {
    if (user && userRole) {
      const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";
      
      if (isAdmin) {
        // Admins see all tasks by default
        setFilters(prev => ({
          ...prev,
          assignedToMe: false,
          createdByMe: false,
          viewType: "all"
        }));
      } else {
        // Non-admins see tasks assigned to them by default
        setFilters(prev => ({
          ...prev,
          assignedToMe: true,
          createdByMe: false,
          viewType: "my"
        }));
      }
    }
  }, [user, userRole]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, sortColumn, sortDirection]);

  // Fetch tasks data
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tasks", currentPage, pageSize, sortColumn, sortDirection, filters, user?.id],
    queryFn: () =>
      fetchTasks({
        page: currentPage,
        pageSize,
        sortColumn,
        sortDirection,
        filters,
      }),
    enabled: !!user,
  });

  // Calculate total pages
  const pageCount = Math.ceil(totalCount / pageSize);

  // Reset filters
  const resetFilters = () => {
    const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";
    
    setFilters({
      search: null,
      taskStatus: null,
      taskType: null,
      priority: null,
      assignedToMe: isAdmin ? false : true,
      createdByMe: false,
      viewType: isAdmin ? "all" : "my",
      assignedUserId: null,
      dueDateFrom: null,
      dueDateTo: null,
      dueDateRange: null,
    });
  };

  return {
    tasks,
    isLoading,
    currentPage,
    pageSize,
    pageCount,
    sortColumn,
    sortDirection,
    filters,
    setPage,
    setPageSize,
    setSortColumn,
    setSortDirection,
    setFilters,
    resetFilters,
    refetch,
  };
}
