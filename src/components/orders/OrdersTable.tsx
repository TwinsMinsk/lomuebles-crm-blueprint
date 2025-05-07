
import React, { useState } from "react";
import { Order } from "@/hooks/useOrders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import DeleteOrderDialog from "./DeleteOrderDialog";
import { Button } from "../ui/button";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (column: string) => void;
  formatCurrency: (amount: number | null) => string;
  formatDate: (dateString: string) => string;
  onOrderClick: (orderId: number) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  sortColumn,
  sortDirection,
  onSort,
  formatCurrency,
  formatDate,
  onOrderClick
}) => {
  // State for delete confirmation dialog
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  const sortIcon = (column: string) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? <ArrowUp className="inline-block w-4 h-4 ml-1" /> : <ArrowDown className="inline-block w-4 h-4 ml-1" />;
    }
    return null;
  };
  
  const handleDeleteClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation(); // Prevent row click
    setOrderToDelete(order);
  };

  const handleCloseDeleteDialog = () => {
    setOrderToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer w-[140px]"
                onClick={() => onSort('order_number')}
              >
                № заказа {sortIcon('order_number')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('order_name')}
              >
                Название {sortIcon('order_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('order_type')}
              >
                Тип {sortIcon('order_type')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('current_status')}
              >
                Статус {sortIcon('current_status')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('contact_name')}
              >
                Клиент {sortIcon('contact_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('company_name')}
              >
                Компания {sortIcon('company_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('manager_name')}
              >
                Ответственный {sortIcon('manager_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('final_amount')}
              >
                Сумма {sortIcon('final_amount')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort('creation_date')}
              >
                Создан {sortIcon('creation_date')}
              </TableHead>
              <TableHead className="text-right">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Загрузка данных...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Заказы не найдены
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.deal_order_id}>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-primary hover:underline" 
                    onClick={() => onOrderClick(order.deal_order_id)}
                  >
                    {order.order_number}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer hover:text-primary hover:underline"
                    onClick={() => onOrderClick(order.deal_order_id)}
                  >
                    {order.order_name || "Без названия"}
                  </TableCell>
                  <TableCell>{order.order_type}</TableCell>
                  <TableCell>{order.current_status || "Не указан"}</TableCell>
                  <TableCell>{order.contact_name}</TableCell>
                  <TableCell>{order.company_name}</TableCell>
                  <TableCell>{order.manager_name}</TableCell>
                  <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                  <TableCell>{formatDate(order.creation_date)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, order)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Удалить заказ</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete confirmation dialog */}
      {orderToDelete && (
        <DeleteOrderDialog
          isOpen={!!orderToDelete}
          onClose={handleCloseDeleteDialog}
          orderNumber={orderToDelete.order_number}
          orderId={orderToDelete.deal_order_id}
        />
      )}
    </>
  );
};

export default OrdersTable;
