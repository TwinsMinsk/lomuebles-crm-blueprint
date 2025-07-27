import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { formatQuantity } from "@/utils/warehouse";
import type { MaterialDeliveryWithDetails } from "@/types/warehouse";

interface MaterialDeliveriesTableProps {
  deliveries: MaterialDeliveryWithDetails[];
  isLoading: boolean;
}

export const MaterialDeliveriesTable = ({ deliveries, isLoading }: MaterialDeliveriesTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (!deliveries.length) {
    return <div className="text-center py-8 text-muted-foreground">Нет поставок для отображения</div>;
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b">
          <th className="p-4 text-left font-medium">Материал</th>
          <th className="p-4 text-left font-medium">Поставщик</th>
          <th className="p-4 text-left font-medium">Заказано</th>
          <th className="p-4 text-left font-medium">Статус</th>
          <th className="p-4 text-left font-medium">Ожидаемая дата</th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody>
        {deliveries.map((delivery) => (
          <ResponsiveRow key={delivery.id}>
            <ResponsiveRowItem 
              label="Материал" 
              value={delivery.material?.name || '-'} 
            />
            <ResponsiveRowItem 
              label="Поставщик" 
              value={(delivery.supplier as any)?.company_name || '-'} 
            />
            <ResponsiveRowItem 
              label="Заказано" 
              value={formatQuantity(delivery.quantity_ordered, delivery.material?.unit || 'шт')} 
            />
            <ResponsiveRowItem 
              label="Статус" 
              value={<ModernStatusBadge status={delivery.delivery_status} />} 
            />
            <ResponsiveRowItem 
              label="Ожидаемая дата" 
              value={delivery.expected_delivery_date ? new Date(delivery.expected_delivery_date).toLocaleDateString('ru-RU') : '-'} 
            />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  );
};