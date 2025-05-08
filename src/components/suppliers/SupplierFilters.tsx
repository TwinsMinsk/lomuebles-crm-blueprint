
import React from "react";
import { Input } from "@/components/ui/input";
import { SupplierFilters as Filters } from "@/types/supplier";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SupplierFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const SupplierFilters: React.FC<SupplierFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value !== "all" ? value : null }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: null,
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            placeholder="Поиск поставщиков..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Select
          value={filters.category || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Категория товаров" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value="Мебель">Мебель</SelectItem>
            <SelectItem value="Освещение">Освещение</SelectItem>
            <SelectItem value="Матрасы">Матрасы</SelectItem>
            <SelectItem value="Ткани">Ткани</SelectItem>
            <SelectItem value="Фурнитура">Фурнитура</SelectItem>
            <SelectItem value="Аксессуары">Аксессуары</SelectItem>
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

export default SupplierFilters;
