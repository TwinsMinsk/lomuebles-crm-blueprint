import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { formatQuantity, formatCurrency } from "@/utils/warehouse";
import type { StockReport } from "@/types/warehouse";

interface StockReportTableProps {
  data: StockReport[];
  isLoading: boolean;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'В наличии':
      return 'success';
    case 'Заканчивается':
      return 'warning';
    case 'Нет в наличии':
      return 'danger';
    case 'Заказано у поставщика':
      return 'info';
    default:
      return 'secondary';
  }
};

export const StockReportTable = ({ data, isLoading }: StockReportTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (!data.length) {
    return <div className="text-center py-8 text-muted-foreground">Нет данных для отображения</div>;
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b">
          <th className="p-4 text-left font-medium">Материал</th>
          <th className="p-4 text-left font-medium">Категория</th>
          <th className="p-4 text-left font-medium">Остаток</th>
          <th className="p-4 text-left font-medium">Резерв</th>
          <th className="p-4 text-left font-medium">Доступно</th>
          <th className="p-4 text-left font-medium">Статус</th>
          <th className="p-4 text-left font-medium">Стоимость</th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody>
        {data.map((item) => (
          <ResponsiveRow key={item.material_id}>
            <ResponsiveRowItem label="Материал" value={item.material_name} />
            <ResponsiveRowItem label="Категория" value={item.category} />
            <ResponsiveRowItem label="Остаток" value={formatQuantity(item.current_quantity, item.unit)} />
            <ResponsiveRowItem label="Резерв" value={formatQuantity(item.reserved_quantity, item.unit)} />
            <ResponsiveRowItem label="Доступно" value={formatQuantity(item.available_quantity, item.unit)} />
            <ResponsiveRowItem 
              label="Статус" 
              value={<ModernStatusBadge status={item.status} variant={getStatusVariant(item.status)} />} 
            />
            <ResponsiveRowItem label="Стоимость" value={formatCurrency(item.total_value)} />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  );
};