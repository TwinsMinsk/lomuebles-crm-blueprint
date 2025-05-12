
import { useState } from "react";
import { useRelatedOrdersData } from "@/hooks/tasks/useRelatedOrdersData";
import EntitySelector from "./EntitySelector";
import { formatDate } from "@/utils/formatters";

interface OrderSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const OrderSelector = ({ value, onChange }: OrderSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { orders, isLoading, error } = useRelatedOrdersData(searchTerm);

  // Format order data for display in entity selector
  const formattedOrders = orders.map((order) => ({
    id: order.id, // This now correctly gets deal_order_id from deals_orders table
    name: order.order_name || `Заказ ${order.order_number}`,
    description: `${formatDate(order.created_at)} - ${order.status}`,
    imageUrl: null,
    subtitle: order.contact_name || 'Без контакта'
  }));

  return (
    <EntitySelector
      value={value}
      onChange={onChange}
      options={formattedOrders}
      isLoading={isLoading}
      error={error?.message}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Поиск заказа..."
      emptyMessage="Заказы не найдены"
      entityLabel="заказ"
    />
  );
};

export default OrderSelector;
