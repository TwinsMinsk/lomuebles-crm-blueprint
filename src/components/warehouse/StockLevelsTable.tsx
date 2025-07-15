import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Package } from "lucide-react";
import { formatQuantity, getStockStatusInfo } from "@/utils/warehouse";
import type { StockLevelWithMaterial } from "@/types/warehouse";

interface StockLevelsTableProps {
  stockLevels: StockLevelWithMaterial[];
  isLoading: boolean;
}

export const StockLevelsTable = ({ stockLevels, isLoading }: StockLevelsTableProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Материал</TableHead>
          <TableHead>Текущий остаток</TableHead>
          <TableHead>Зарезервировано</TableHead>
          <TableHead>Доступно</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Расположение</TableHead>
          <TableHead>Последнее движение</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockLevels.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Данные о складских остатках не найдены
            </TableCell>
          </TableRow>
        ) : (
          stockLevels.map((stockLevel) => (
            <TableRow key={stockLevel.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{stockLevel.material?.name}</div>
                    {stockLevel.material?.sku && (
                      <div className="text-sm text-muted-foreground">SKU: {stockLevel.material.sku}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {formatQuantity(stockLevel.current_quantity, stockLevel.material?.unit || 'шт')}
                </span>
              </TableCell>
              <TableCell>
                {formatQuantity(stockLevel.reserved_quantity, stockLevel.material?.unit || 'шт')}
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {formatQuantity(
                    stockLevel.available_quantity || (stockLevel.current_quantity - stockLevel.reserved_quantity),
                    stockLevel.material?.unit || 'шт'
                  )}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStockStatusInfo(stockLevel.status).className}>
                  {getStockStatusInfo(stockLevel.status).label}
                </Badge>
              </TableCell>
              <TableCell>
                {stockLevel.location || "—"}
              </TableCell>
              <TableCell>
                {stockLevel.last_movement_date 
                  ? new Date(stockLevel.last_movement_date).toLocaleDateString()
                  : "—"
                }
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};