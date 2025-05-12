
import React, { useState } from "react";
import { useOrders } from "@/hooks/orders/useOrders";
import { useDeleteOrder } from "@/hooks/orders/useDeleteOrder";
import { Link } from "react-router-dom";
import { formatDate } from "@/utils/formatters";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import OrderViewPopup from "./OrderViewPopup";

const OrdersTable: React.FC = () => {
  const { data: orders, isLoading, error } = useOrders();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const [selectedOrderIdForView, setSelectedOrderIdForView] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Ошибка загрузки данных: {error.message}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Заказы не найдены.</p>
      </div>
    );
  }

  const handleDelete = (orderId: number) => {
    deleteOrder(orderId, {
      onSuccess: () => {
        toast.success("Заказ успешно удален");
      },
      onError: (err) => {
        toast.error(`Ошибка при удалении заказа: ${err.message}`);
      }
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Номер заказа</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Клиент</TableHead>
            <TableHead>Менеджер</TableHead>
            <TableHead className="text-right">Сумма</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id}
              className="cursor-pointer hover:bg-muted/60"
              onClick={(e) => {
                // Prevent opening popup if clicking on action buttons
                if ((e.target as HTMLElement).closest('button') || 
                    (e.target as HTMLElement).closest('a')) {
                  return;
                }
                setSelectedOrderIdForView(order.id);
              }}
            >
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{order.order_name || "-"}</TableCell>
              <TableCell>{order.order_type}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.contact_name || "-"}</TableCell>
              <TableCell>{order.assigned_user_name || "-"}</TableCell>
              <TableCell className="text-right">{formatCurrency(order.final_amount)}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to={`/orders/${order.id}`}>
                    <Pencil className="h-4 w-4 mr-1" /> 
                    Редактировать
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-1" /> 
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удаление заказа</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить заказ #{order.order_number}?
                        Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(order.id)}
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog 
        open={!!selectedOrderIdForView} 
        onOpenChange={(isOpen) => !isOpen && setSelectedOrderIdForView(null)}
      >
        <DialogContent className="sm:max-w-[650px]">
          <OrderViewPopup orderId={selectedOrderIdForView} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTable;
