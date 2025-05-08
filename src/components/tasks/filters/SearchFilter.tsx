
import React from "react";
import { Input } from "@/components/ui/input";
import { TaskFiltersType } from "@/types/task";

interface SearchFilterProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ value, onChange }) => {
  return (
    <Input
      placeholder="Поиск по названию или описанию задачи"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};

export default SearchFilter;
