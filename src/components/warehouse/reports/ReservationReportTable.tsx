import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { formatQuantity } from "@/utils/warehouse";
import type { ReservationReport } from "@/types/warehouse";

interface ReservationReportTableProps {
  data: ReservationReport[];
  isLoading: boolean;
}

export const ReservationReportTable = ({ data, isLoading }: ReservationReportTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (!data.length) {
    return <div className="text-center py-8 text-muted-foreground">Нет резервов для отображения</div>;
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b">
          <th className="p-4 text-left font-medium">Материал</th>
          <th className="p-4 text-left font-medium">Категория</th>
          <th className="p-4 text-left font-medium">Зарезервировано</th>
          <th className="p-4 text-left font-medium">Доступно</th>
          <th className="p-4 text-left font-medium">Резервов</th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody>
        {data.map((reservation) => (
          <ResponsiveRow key={reservation.material_id}>
            <ResponsiveRowItem label="Материал" value={reservation.material_name} />
            <ResponsiveRowItem label="Категория" value={reservation.category} />
            <ResponsiveRowItem label="Зарезервировано" value={formatQuantity(reservation.total_reserved, reservation.unit)} />
            <ResponsiveRowItem label="Доступно" value={formatQuantity(reservation.available_quantity, reservation.unit)} />
            <ResponsiveRowItem label="Резервов" value={reservation.reservations.length} />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  );
};