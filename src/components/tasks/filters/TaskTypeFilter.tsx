
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskTypeFilterProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

const TaskTypeFilter: React.FC<TaskTypeFilterProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value || ""}
      onValueChange={(value) => onChange(value !== "" ? value : null)}
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
  );
};

export default TaskTypeFilter;
