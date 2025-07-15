import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Package } from "lucide-react";
import { formatQuantity, formatCurrency, getMovementTypeColor } from "@/utils/warehouse";
import type { StockMovementWithDetails } from "@/types/warehouse";

interface StockMovementsTableProps {
  movements: StockMovementWithDetails[];
  isLoading: boolean;
}

export const StockMovementsTable = ({ movements, isLoading }: StockMovementsTableProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Дата</TableHead>
          <TableHead>Материал</TableHead>
          <TableHead>Тип движения</TableHead>
          <TableHead>Количество</TableHead>
          <TableHead>Стоимость за единицу</TableHead>
          <TableHead>Общая стоимость</TableHead>
          <TableHead>Документ</TableHead>
          <TableHead>Создал</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              Движения материалов не найдены
            </TableCell>
          </TableRow>
        ) : (
          movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {new Date(movement.movement_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{movement.material_name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getMovementTypeColor(movement.movement_type)}>
                  {movement.movement_type}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {formatQuantity(movement.quantity, movement.material_unit || 'шт')}
                </span>
              </TableCell>
              <TableCell>
                {movement.unit_cost ? formatCurrency(movement.unit_cost) : "—"}
              </TableCell>
              <TableCell>
                {movement.total_cost ? formatCurrency(movement.total_cost) : "—"}
              </TableCell>
              <TableCell>
                {movement.reference_document || "—"}
              </TableCell>
              <TableCell>
                {movement.created_by_name || "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};