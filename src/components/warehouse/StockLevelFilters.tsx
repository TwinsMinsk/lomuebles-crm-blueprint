import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { MATERIAL_CATEGORIES, STOCK_STATUSES } from "@/types/warehouse";
import type { MaterialFilters } from "@/types/warehouse";

interface StockLevelFiltersProps {
  filters: MaterialFilters;
  onFiltersChange: (filters: MaterialFilters) => void;
}

export const StockLevelFilters = ({ filters, onFiltersChange }: StockLevelFiltersProps) => {
  const { data: suppliersData } = useSuppliers({
    page: 1,
    limit: 100,
    searchQuery: "",
    category: null
  });
  const suppliers = suppliersData?.suppliers || [];

  const updateFilter = (key: keyof MaterialFilters, value: any) => {
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
            placeholder="Название или SKU..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Категория</Label>
          <Select 
            value={filters.category || ""} 
            onValueChange={(value) => updateFilter("category", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все категории</SelectItem>
              {MATERIAL_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
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

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="low_stock"
              checked={filters.low_stock_only || false}
              onCheckedChange={(checked) => updateFilter("low_stock_only", checked)}
            />
            <Label htmlFor="low_stock">Заканчивающиеся</Label>
          </div>
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