
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ViewTypeFilterProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
}

const ViewTypeFilter: React.FC<ViewTypeFilterProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value || "my"}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Режим просмотра" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="my">Мои задачи</SelectItem>
        <SelectItem value="all">Все задачи</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ViewTypeFilter;
