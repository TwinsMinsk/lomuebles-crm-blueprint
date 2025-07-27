import { ResponsiveTable } from "@/components/ui/responsive-table";
import { formatQuantity, formatCurrency } from "@/utils/warehouse";
import type { StockMovementWithDetails } from "@/types/warehouse";

interface MovementReportTableProps {
  data: StockMovementWithDetails[];
  isLoading: boolean;
}

export const MovementReportTable = ({ data, isLoading }: MovementReportTableProps) => {
  const columns = [
    { key: "movement_date", label: "Дата" },
    { key: "material_name", label: "Материал" },
    { key: "movement_type", label: "Тип" },
    { key: "quantity", label: "Количество" },
    { key: "supplier_name", label: "Поставщик" },
    { key: "total_cost", label: "Стоимость" },
  ];

  const formatRow = (item: StockMovementWithDetails) => ({
    movement_date: new Date(item.movement_date).toLocaleDateString('ru-RU'),
    material_name: item.material_name || '-',
    movement_type: item.movement_type,
    quantity: formatQuantity(item.quantity, item.material_unit || 'шт'),
    supplier_name: item.supplier_name || '-',
    total_cost: formatCurrency(item.total_cost),
  });

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      formatRow={formatRow}
      isLoading={isLoading}
      emptyMessage="Нет движений для отображения"
    />
  );
};