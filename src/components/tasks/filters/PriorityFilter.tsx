
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriorityFilterProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

const PriorityFilter: React.FC<PriorityFilterProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value || "all"}
      onValueChange={(value) => onChange(value !== "all" ? value : null)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Приоритет" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все приоритеты</SelectItem>
        <SelectItem value="Низкий">Низкий</SelectItem>
        <SelectItem value="Средний">Средний</SelectItem>
        <SelectItem value="Высокий">Высокий</SelectItem>
        <SelectItem value="Срочно">Срочно</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PriorityFilter;
