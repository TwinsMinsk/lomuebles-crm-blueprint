
import React from "react";
import { taskStatusOptions } from "@/components/tasks/schema/taskFormSchema";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface TaskStatusFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const TaskStatusFilter: React.FC<TaskStatusFilterProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="w-64">
      <label className="block text-sm font-medium mb-1">
        Статус задачи
      </label>
      <Select
        value={value || "all"}
        onValueChange={(value) => onChange(value === "all" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {taskStatusOptions && taskStatusOptions
            .filter(option => option.value && option.value.trim() !== "") // Filter out options with empty values
            .map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value} 
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskStatusFilter;
