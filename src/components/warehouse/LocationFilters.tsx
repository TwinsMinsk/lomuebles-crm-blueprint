import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { LocationFilters as LocationFiltersType } from "@/hooks/warehouse/useLocations";

interface LocationFiltersProps {
  filters: LocationFiltersType;
  onFiltersChange: (filters: LocationFiltersType) => void;
}

export const LocationFilters = ({ filters, onFiltersChange }: LocationFiltersProps) => {
  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.is_active !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Фильтры</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Очистить фильтры
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Поиск</label>
          <Input
            placeholder="Поиск по названию, адресу или описанию..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Статус</label>
          <Select
            value={filters.is_active === undefined ? "all" : (filters.is_active ? "active" : "inactive")}
            onValueChange={(value) => {
              const is_active = value === "all" ? undefined : value === "active";
              onFiltersChange({ ...filters, is_active });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};