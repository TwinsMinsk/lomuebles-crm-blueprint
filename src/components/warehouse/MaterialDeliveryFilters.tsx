import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DELIVERY_STATUSES, type MaterialDeliveryFilters as MaterialDeliveryFiltersType, type DeliveryStatus } from "@/types/warehouse";

interface MaterialDeliveryFiltersProps {
  filters: MaterialDeliveryFiltersType;
  onFiltersChange: (filters: MaterialDeliveryFiltersType) => void;
}

export const MaterialDeliveryFilters = ({ filters, onFiltersChange }: MaterialDeliveryFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
      <Select 
        value={filters.delivery_status || "all"} 
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          delivery_status: value === "all" ? undefined : value as DeliveryStatus 
        })}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {DELIVERY_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};