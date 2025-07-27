import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { formatQuantity, formatCurrency } from "@/utils/warehouse";
import type { StockMovementWithDetails } from "@/types/warehouse";

interface MovementReportTableProps {
  data: StockMovementWithDetails[];
  isLoading: boolean;
}

export const MovementReportTable = ({ data, isLoading }: MovementReportTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (!data.length) {
    return <div className="text-center py-8 text-muted-foreground">Нет движений для отображения</div>;
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b">
          <th className="p-4 text-left font-medium">Дата</th>
          <th className="p-4 text-left font-medium">Материал</th>
          <th className="p-4 text-left font-medium">Тип</th>
          <th className="p-4 text-left font-medium">Количество</th>
          <th className="p-4 text-left font-medium">Поставщик</th>
          <th className="p-4 text-left font-medium">Стоимость</th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody>
        {data.map((movement) => (
          <ResponsiveRow key={movement.id}>
            <ResponsiveRowItem 
              label="Дата" 
              value={new Date(movement.movement_date).toLocaleDateString('ru-RU')} 
            />
            <ResponsiveRowItem 
              label="Материал" 
              value={movement.material_name || '-'} 
            />
            <ResponsiveRowItem 
              label="Тип" 
              value={movement.movement_type} 
            />
            <ResponsiveRowItem 
              label="Количество" 
              value={formatQuantity(movement.quantity, movement.material_unit || 'шт')} 
            />
            <ResponsiveRowItem 
              label="Поставщик" 
              value={movement.supplier_name || '-'} 
            />
            <ResponsiveRowItem 
              label="Стоимость" 
              value={formatCurrency(movement.total_cost)} 
            />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  );
};