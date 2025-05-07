
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Order } from "@/hooks/useOrders";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  formatCurrency: (amount: number | null) => string;
  formatDate: (dateString: string) => string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  sortColumn,
  sortDirection,
  onSort,
  formatCurrency,
  formatDate
}) => {
  // Column configuration
  const columns = [
    { key: 'deal_order_id', label: 'ID Заказа' },
    { key: 'order_number', label: 'Номер заказа' },
    { key: 'order_name', label: 'Название заказа' },
    { key: 'order_type', label: 'Тип заказа' },
    { key: 'contact_name', label: 'Клиент' },
    { key: 'company_name', label: 'Компания' },
    { key: 'final_amount', label: 'Итоговая сумма' },
    { key: 'current_status', label: 'Текущий статус' },
    { key: 'manager_name', label: 'Ответственный менеджер' },
    { key: 'creation_date', label: 'Дата создания' },
    { key: 'payment_status', label: 'Статус оплаты' }
  ];

  // Sort indicator
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className="cursor-pointer"
                onClick={() => onSort(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  <SortIndicator column={column.key} />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                Загрузка данных...
              </TableCell>
            </TableRow>
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.deal_order_id}>
                <TableCell>{order.deal_order_id}</TableCell>
                <TableCell>{order.order_number}</TableCell>
                <TableCell>{order.order_name || "Без названия"}</TableCell>
                <TableCell>{order.order_type}</TableCell>
                <TableCell>{order.contact_name}</TableCell>
                <TableCell>{order.company_name}</TableCell>
                <TableCell>{order.final_amount ? formatCurrency(order.final_amount) : "Не указано"}</TableCell>
                <TableCell>{order.current_status || "Не указан"}</TableCell>
                <TableCell>{order.manager_name}</TableCell>
                <TableCell>{formatDate(order.creation_date)}</TableCell>
                <TableCell>{order.payment_status || "Не указан"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                Заказы не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
