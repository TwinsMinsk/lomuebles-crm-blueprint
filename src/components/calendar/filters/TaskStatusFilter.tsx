
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
          {taskStatusOptions.map((option) => (
            <SelectItem 
              key={option.value || "unknown"} 
              value={option.value || "unknown"} // Ensure value is never empty
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
