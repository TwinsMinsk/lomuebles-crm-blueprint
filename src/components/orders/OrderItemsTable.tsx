
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import { OrderItem } from "@/types/order";

interface OrderItemsTableProps {
  orderId: number;
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ orderId }) => {
  const { data: orderItems, isLoading, error } = useQuery({
    queryKey: ["orderItems", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("parent_order_id", orderId); // Updated from parent_deal_order_id to parent_order_id

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return <TableSkeleton columns={5} rows={3} />;
  }

  if (error) {
    return <p className="text-red-500">Ошибка загрузки товаров</p>;
  }

  if (!orderItems || orderItems.length === 0) {
    return <p className="text-gray-500">Товары не добавлены</p>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Название</TableHead>
          <TableHead>Артикул</TableHead>
          <TableHead className="text-right">Количество</TableHead>
          <TableHead className="text-right">Цена за шт.</TableHead>
          <TableHead className="text-right">Сумма</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderItems.map((item) => (
          <TableRow key={item.order_item_id}>
            <TableCell className="font-medium">{item.product_name_from_tilda}</TableCell>
            <TableCell>{item.sku_from_tilda || "-"}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.price_per_item_from_tilda)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.total_item_price)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={4} className="text-right font-bold">
            Итого:
          </TableCell>
          <TableCell className="text-right font-bold">
            {formatCurrency(
              orderItems.reduce((sum, item) => sum + item.total_item_price, 0)
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default OrderItemsTable;
