
import React from "react";
import { Input } from "@/components/ui/input";
import { ProductFilters as Filters } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ProductFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value !== "all" ? value : null }));
  };

  const handleTemplateTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, isCustomTemplate: value !== "all" ? value : null }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: null,
      isCustomTemplate: null,
    });
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            placeholder="Поиск товаров..."
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
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value="Столы">Столы</SelectItem>
            <SelectItem value="Стулья">Стулья</SelectItem>
            <SelectItem value="Кровати">Кровати</SelectItem>
            <SelectItem value="Шкафы">Шкафы</SelectItem>
            <SelectItem value="Диваны">Диваны</SelectItem>
            <SelectItem value="Комоды">Комоды</SelectItem>
            <SelectItem value="Другое">Другое</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.isCustomTemplate || "all"}
          onValueChange={handleTemplateTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип товара" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="true">На заказ</SelectItem>
            <SelectItem value="false">Готовый</SelectItem>
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

export default ProductFilters;
