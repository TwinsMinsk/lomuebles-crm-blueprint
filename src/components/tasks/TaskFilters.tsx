
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskFiltersType } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  setFilters: (filters: TaskFiltersType) => void;
  resetFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
}) => {
  const { user, userRole } = useAuth();
  const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  // Fetch users for the user filter dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  // Handler for filter changes
  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  // Handler for date range filter
  const handleDateRangeSelect = (range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);
    if (range.from) {
      const updatedFilters = { ...filters };
      updatedFilters.dueDateFrom = range.from;
      updatedFilters.dueDateTo = range.to || range.from;
      setFilters(updatedFilters);
    }
  };

  // Handler for predefined date ranges
  const handlePredefinedDateRange = (rangeType: string) => {
    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch(rangeType) {
      case 'overdue':
        toDate = new Date(now.setHours(0, 0, 0, 0));
        toDate.setDate(toDate.getDate() - 1);
        break;
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        toDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'thisWeek':
        fromDate = new Date(now);
        const dayOfWeek = fromDate.getDay();
        const diff = fromDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
        fromDate = new Date(fromDate.setDate(diff));
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + 6);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'all':
        fromDate = null;
        toDate = null;
        break;
    }

    setDateRange({ from: fromDate, to: toDate });
    handleFilterChange('dueDateFrom', fromDate);
    handleFilterChange('dueDateTo', toDate);
    handleFilterChange('dueDateRange', rangeType);
  };

  // Handler for assigned user filter
  const handleUserFilterChange = (value: string) => {
    if (value === "all") {
      handleFilterChange("assignedUserId", null);
    } else if (value === "my") {
      handleFilterChange("assignedUserId", user?.id || null);
    } else {
      handleFilterChange("assignedUserId", value);
    }
  };

  // Handler for task view change
  const handleTaskViewChange = (view: string) => {
    if (view === "my") {
      setFilters({
        ...filters,
        assignedToMe: true,
        createdByMe: true,
        viewType: "my",
      });
    } else if (view === "all") {
      setFilters({
        ...filters,
        assignedToMe: false,
        createdByMe: false,
        viewType: "all",
      });
    }
  };

  const applyFilters = () => {
    // This function would trigger the refetch if needed
    // Currently, filters are applied reactively
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search filter */}
        <div className="w-full sm:w-auto flex-1">
          <Input
            placeholder="Поиск по названию или описанию задачи"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>

        {/* View filter (My tasks vs All tasks) */}
        {isAdmin && (
          <div className="w-full sm:w-[180px]">
            <Select
              value={filters.viewType || "my"}
              onValueChange={handleTaskViewChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Режим просмотра" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my">Мои задачи</SelectItem>
                <SelectItem value="all">Все задачи</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Status filter */}
        <div>
          <Select
            value={filters.taskStatus || ""}
            onValueChange={(value) => handleFilterChange("taskStatus", value !== "" ? value : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Статус задачи" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="Новая">Новая</SelectItem>
              <SelectItem value="В работе">В работе</SelectItem>
              <SelectItem value="Ожидает">Ожидает</SelectItem>
              <SelectItem value="Выполнена">Выполнена</SelectItem>
              <SelectItem value="Отменена">Отменена</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned user filter */}
        <div>
          <Select
            value={filters.assignedUserId || (filters.assignedToMe ? "my" : "all")}
            onValueChange={handleUserFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ответственный" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все исполнители</SelectItem>
              <SelectItem value="my">Мои задачи</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task type filter */}
        <div>
          <Select
            value={filters.taskType || ""}
            onValueChange={(value) => handleFilterChange("taskType", value !== "" ? value : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Тип задачи" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все типы</SelectItem>
              <SelectItem value="Звонок">Звонок</SelectItem>
              <SelectItem value="Встреча">Встреча</SelectItem>
              <SelectItem value="Замер">Замер</SelectItem>
              <SelectItem value="Подготовка КП">Подготовка КП</SelectItem>
              <SelectItem value="Дизайн">Дизайн</SelectItem>
              <SelectItem value="Монтаж">Монтаж</SelectItem>
              <SelectItem value="Другое">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <div>
          <Select
            value={filters.priority || ""}
            onValueChange={(value) => handleFilterChange("priority", value !== "" ? value : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все приоритеты</SelectItem>
              <SelectItem value="Низкий">Низкий</SelectItem>
              <SelectItem value="Средний">Средний</SelectItem>
              <SelectItem value="Высокий">Высокий</SelectItem>
              <SelectItem value="Срочно">Срочно</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due date filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Tabs 
            defaultValue={filters.dueDateRange || "all"} 
            onValueChange={handlePredefinedDateRange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">Все даты</TabsTrigger>
              <TabsTrigger value="overdue">Просроченные</TabsTrigger>
              <TabsTrigger value="today">Сегодня</TabsTrigger>
              <TabsTrigger value="thisWeek">Эта неделя</TabsTrigger>
              <TabsTrigger value="thisMonth">Этот месяц</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="sm:w-[240px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                      {format(dateRange.to, "dd.MM.yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd.MM.yyyy")
                  )
                ) : (
                  <span>Выберите даты</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filter action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={applyFilters}>
          Применить фильтры
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          Сбросить фильтры
        </Button>
      </div>
    </div>
  );
};

export default TaskFilters;
