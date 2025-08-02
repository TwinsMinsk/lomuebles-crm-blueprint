import { useState } from "react";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowUpDown } from "lucide-react";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useStockLevelsByLocation } from "@/hooks/warehouse/useStockLevelsByLocation";
import { formatQuantity, getStockStatusInfo } from "@/utils/warehouse";
import type { StockLevelWithMaterial } from "@/types/warehouse";

interface LocationMaterialsTableProps {
  locationName: string;
  isLoading?: boolean;
}

export const LocationMaterialsTable = ({ locationName, isLoading = false }: LocationMaterialsTableProps) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'quantity'>('name');

  const { data: stockLevels, isLoading: isLoadingStock } = useStockLevelsByLocation(locationName);

  const loading = isLoading || isLoadingStock;

  if (loading) {
    return <LoadingSkeleton variant="table" lines={5} className="h-16" />;
  }

  if (!stockLevels || stockLevels.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>В данной локации нет материалов</p>
      </div>
    );
  }

  const sortedStockLevels = [...stockLevels].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.material?.name || '';
        bValue = b.material?.name || '';
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'quantity':
        aValue = a.current_quantity || 0;
        bValue = b.current_quantity || 0;
        break;
      default:
        aValue = a.material?.name || '';
        bValue = b.material?.name || '';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const handleSort = (column: 'name' | 'status' | 'quantity') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortButton = ({ column, children }: { column: 'name' | 'status' | 'quantity'; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-8 p-2 font-medium"
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Материалы в локации</h3>
        <Badge variant="secondary" className="text-sm">
          {stockLevels.length} материалов
        </Badge>
      </div>
      
      <ResponsiveTable>
        {/* Desktop Headers */}
        <thead className="hidden lg:table-header-group">
          <tr>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              <SortButton column="name">Материал</SortButton>
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Категория
            </th>
            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
              <SortButton column="quantity">Количество</SortButton>
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              <SortButton column="status">Статус</SortButton>
            </th>
          </tr>
        </thead>
        
        {/* Responsive Rows - handles both desktop and mobile */}
        {sortedStockLevels.map((stockLevel) => {
          const material = stockLevel.material;
          const available = (stockLevel.current_quantity || 0) - (stockLevel.reserved_quantity || 0);
          const statusInfo = getStockStatusInfo(stockLevel.status || 'В наличии');
          
          return (
            <ResponsiveRow key={`${stockLevel.material_id}-${stockLevel.location}`}>
              <ResponsiveRowItem
                label="Материал"
                value={
                  <div>
                    <div className="font-medium">{material?.name}</div>
                    {material?.sku && (
                      <div className="text-sm text-muted-foreground">SKU: {material.sku}</div>
                    )}
                  </div>
                }
                fullWidth
              />
              <ResponsiveRowItem
                label="Категория"
                value={material?.category && (
                  <Badge variant="outline" className="text-xs">
                    {material.category}
                  </Badge>
                )}
              />
              <ResponsiveRowItem
                label="Количество"
                value={
                  <div className="text-right">
                    <div className="font-medium">
                      {formatQuantity(stockLevel.current_quantity || 0, material?.unit || 'шт')}
                    </div>
                    {(stockLevel.reserved_quantity || 0) > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Доступно: {formatQuantity(available, material?.unit || 'шт')}
                      </div>
                    )}
                  </div>
                }
              />
              <ResponsiveRowItem
                label="Статус"
                value={
                  <ModernStatusBadge
                    status={statusInfo.label}
                    variant={stockLevel.status === 'В наличии' ? 'success' : 
                           stockLevel.status === 'Заканчивается' ? 'warning' : 'danger'}
                  />
                }
              />
            </ResponsiveRow>
          );
        })}
      </ResponsiveTable>
    </div>
  );
};