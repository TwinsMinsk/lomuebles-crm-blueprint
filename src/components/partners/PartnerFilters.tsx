
import React from "react";
import { Input } from "@/components/ui/input";
import { PartnerFilters as Filters } from "@/types/partner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface PartnerFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const PartnerFilters: React.FC<PartnerFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleSpecializationChange = (value: string) => {
    setFilters((prev) => ({ ...prev, specialization: value !== "all" ? value : null }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      specialization: null,
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            placeholder="Поиск партнеров..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Select
          value={filters.specialization || "all"}
          onValueChange={handleSpecializationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Специализация" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все специализации</SelectItem>
            <SelectItem value="Шкафы">Шкафы</SelectItem>
            <SelectItem value="Двери">Двери</SelectItem>
            <SelectItem value="Кровати">Кровати</SelectItem>
            <SelectItem value="Столы">Столы</SelectItem>
            <SelectItem value="Стулья">Стулья</SelectItem>
            <SelectItem value="Диваны">Диваны</SelectItem>
            <SelectItem value="Полный цикл">Полный цикл</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>Сбросить</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartnerFilters;
