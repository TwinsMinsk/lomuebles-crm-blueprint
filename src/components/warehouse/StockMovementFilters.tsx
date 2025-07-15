import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMaterials } from "@/hooks/warehouse/useMaterials";
import { STOCK_MOVEMENT_TYPES } from "@/types/warehouse";
import type { StockMovementFilters as StockMovementFiltersType } from "@/types/warehouse";

interface StockMovementFiltersProps {
  filters: StockMovementFiltersType;
  onFiltersChange: (filters: StockMovementFiltersType) => void;
}

export const StockMovementFilters = ({ filters, onFiltersChange }: StockMovementFiltersProps) => {
  const { data: suppliersData } = useSuppliers();
  const suppliers = suppliersData?.suppliers || [];
  const { data: materials } = useMaterials();

  const updateFilter = (key: keyof StockMovementFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== "" && value !== null
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Поиск</Label>
          <Input
            id="search"
            placeholder="Материал или документ..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="movement_type">Тип движения</Label>
          <Select 
            value={filters.movement_type || ""} 
            onValueChange={(value) => updateFilter("movement_type", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все типы</SelectItem>
              {STOCK_MOVEMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="material">Материал</Label>
          <Select 
            value={filters.material_id?.toString() || ""} 
            onValueChange={(value) => updateFilter("material_id", value ? Number(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все материалы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все материалы</SelectItem>
              {materials?.map((material) => (
                <SelectItem key={material.id} value={material.id.toString()}>
                  {material.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="supplier">Поставщик</Label>
          <Select 
            value={filters.supplier_id?.toString() || ""} 
            onValueChange={(value) => updateFilter("supplier_id", value ? Number(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все поставщики" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все поставщики</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.supplier_id} value={supplier.supplier_id.toString()}>
                  {supplier.supplier_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date_from">Дата от</Label>
          <Input
            id="date_from"
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => updateFilter("date_from", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="date_to">Дата до</Label>
          <Input
            id="date_to"
            type="date"
            value={filters.date_to || ""}
            onChange={(e) => updateFilter("date_to", e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-muted-foreground">
            Применены фильтры
          </span>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Очистить фильтры
          </Button>
        </div>
      )}
    </div>
  );
};