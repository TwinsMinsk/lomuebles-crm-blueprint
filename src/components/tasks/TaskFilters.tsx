
import React from "react";
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
import { TaskFiltersType } from "@/types/task";

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

  // Handler for filter changes
  const handleFilterChange = (key: keyof TaskFiltersType, value: string | null) => {
    setFilters({ ...filters, [key]: value });
  };

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search filter */}
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Поиск по названию задачи"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-[180px]">
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
              <SelectItem value="Завершена">Завершена</SelectItem>
              <SelectItem value="Отложена">Отложена</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task type filter */}
        <div className="w-full sm:w-[180px]">
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
              <SelectItem value="Монтаж">Монтаж</SelectItem>
              <SelectItem value="Дизайн">Дизайн</SelectItem>
              <SelectItem value="Другое">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <div className="w-full sm:w-[180px]">
          <Select
            value={filters.priority || ""}
            onValueChange={(value) => handleFilterChange("priority", value !== "" ? value : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Любой приоритет</SelectItem>
              <SelectItem value="Низкий">Низкий</SelectItem>
              <SelectItem value="Средний">Средний</SelectItem>
              <SelectItem value="Высокий">Высокий</SelectItem>
              <SelectItem value="Критический">Критический</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Reset filters button */}
      <div>
        <Button variant="outline" onClick={resetFilters}>
          Сбросить фильтры
        </Button>
      </div>
    </div>
  );
};

export default TaskFilters;
