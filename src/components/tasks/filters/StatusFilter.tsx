
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value || "all"}
      onValueChange={(value) => onChange(value !== "all" ? value : null)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Статус задачи" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все статусы</SelectItem>
        <SelectItem value="Новая">Новая</SelectItem>
        <SelectItem value="В работе">В работе</SelectItem>
        <SelectItem value="Ожидает">Ожидает</SelectItem>
        <SelectItem value="Выполнена">Выполнена</SelectItem>
        <SelectItem value="Отменена">Отменена</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
