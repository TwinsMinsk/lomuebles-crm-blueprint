
import { useState } from "react";
import { useRelatedOrdersData } from "@/hooks/tasks/useRelatedOrdersData";
import EntitySelector from "./EntitySelector";
import { formatDate } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";

interface OrderSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const OrderSelector = ({ value, onChange }: OrderSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { orders, isLoading, error } = useRelatedOrdersData(searchTerm);

  // Enhanced logging for debugging
  console.log("OrderSelector received orders:", {
    count: orders.length,
    orderIds: orders.map(o => o.id),
    orderNames: orders.map(o => o.order_name || o.order_number)
  });

  // Format order data for display in entity selector
  const formattedOrders = orders.map((order) => ({
    id: order.id, 
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
      emptyMessage={user ? "Заказы не найдены" : "Авторизуйтесь для просмотра заказов"}
      entityLabel="заказ"
    />
  );
};

export default OrderSelector;
