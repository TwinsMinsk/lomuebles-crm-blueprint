import { ResponsiveTable } from "@/components/ui/responsive-table";
import { formatQuantity } from "@/utils/warehouse";
import type { ReservationReport } from "@/types/warehouse";

interface ReservationReportTableProps {
  data: ReservationReport[];
  isLoading: boolean;
}

export const ReservationReportTable = ({ data, isLoading }: ReservationReportTableProps) => {
  const columns = [
    { key: "material_name", label: "Материал" },
    { key: "category", label: "Категория" },
    { key: "total_reserved", label: "Зарезервировано" },
    { key: "available_quantity", label: "Доступно" },
    { key: "reservations_count", label: "Резервов" },
  ];

  const formatRow = (item: ReservationReport) => ({
    material_name: item.material_name,
    category: item.category,
    total_reserved: formatQuantity(item.total_reserved, item.unit),
    available_quantity: formatQuantity(item.available_quantity, item.unit),
    reservations_count: item.reservations.length,
  });

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      formatRow={formatRow}
      isLoading={isLoading}
      emptyMessage="Нет резервов для отображения"
    />
  );
};