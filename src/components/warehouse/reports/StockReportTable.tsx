import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { formatQuantity, formatCurrency, getStockStatusInfo } from "@/utils/warehouse";
import type { StockReport } from "@/types/warehouse";

interface StockReportTableProps {
  data: StockReport[];
  isLoading: boolean;
}

export const StockReportTable = ({ data, isLoading }: StockReportTableProps) => {
  const columns = [
    { key: "material_name", label: "Материал" },
    { key: "category", label: "Категория" },
    { key: "current_quantity", label: "Остаток" },
    { key: "reserved_quantity", label: "Резерв" },
    { key: "available_quantity", label: "Доступно" },
    { key: "status", label: "Статус" },
    { key: "total_value", label: "Стоимость" },
  ];

  const formatRow = (item: StockReport) => ({
    material_name: item.material_name,
    category: item.category,
    current_quantity: formatQuantity(item.current_quantity, item.unit),
    reserved_quantity: formatQuantity(item.reserved_quantity, item.unit),
    available_quantity: formatQuantity(item.available_quantity, item.unit),
    status: <ModernStatusBadge status={item.status} variant={getStockStatusInfo(item.status).className} />,
    total_value: formatCurrency(item.total_value),
  });

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      formatRow={formatRow}
      isLoading={isLoading}
      emptyMessage="Нет данных для отображения"
    />
  );
};