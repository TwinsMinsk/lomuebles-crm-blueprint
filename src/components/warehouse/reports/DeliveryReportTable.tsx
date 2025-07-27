import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { formatQuantity, formatCurrency } from "@/utils/warehouse";
import type { MaterialDeliveryWithDetails } from "@/types/warehouse";

interface DeliveryReportTableProps {
  data: MaterialDeliveryWithDetails[];
  isLoading: boolean;
}

export const DeliveryReportTable = ({ data, isLoading }: DeliveryReportTableProps) => {
  const columns = [
    { key: "material_name", label: "Материал" },
    { key: "supplier_name", label: "Поставщик" },
    { key: "quantity_ordered", label: "Заказано" },
    { key: "quantity_delivered", label: "Доставлено" },
    { key: "delivery_status", label: "Статус" },
    { key: "expected_date", label: "Ожидаемая дата" },
  ];

  const formatRow = (item: MaterialDeliveryWithDetails) => ({
    material_name: item.material?.name || '-',
    supplier_name: (item.supplier as any)?.company_name || '-',
    quantity_ordered: formatQuantity(item.quantity_ordered, item.material?.unit || 'шт'),
    quantity_delivered: formatQuantity(item.quantity_delivered, item.material?.unit || 'шт'),
    delivery_status: <ModernStatusBadge status={item.delivery_status} />,
    expected_date: item.expected_delivery_date ? new Date(item.expected_delivery_date).toLocaleDateString('ru-RU') : '-',
  });

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      formatRow={formatRow}
      isLoading={isLoading}
      emptyMessage="Нет поставок для отображения"
    />
  );
};