
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTasks } from "@/hooks/useTasks";
import { TaskFiltersType } from "@/types/task";
import { useAuth } from "@/context/AuthContext";

export function useTasksState() {
  // State
  const [currentPage, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: null,
    taskStatus: null,
    taskType: null,
    priority: null,
    assignedToMe: true,
    createdByMe: true,
    viewType: "my",
    assignedUserId: null,
    dueDateFrom: null,
    dueDateTo: null,
    dueDateRange: null,
  });

  const { user } = useAuth();
  const { fetchTasks, totalCount } = useTasks();

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
    setFilters({
      search: null,
      taskStatus: null,
      taskType: null,
      priority: null,
      assignedToMe: true,
      createdByMe: true,
      viewType: "my",
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
