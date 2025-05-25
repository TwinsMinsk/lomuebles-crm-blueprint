
import React, { useState } from "react";
import { useOrders } from "@/hooks/orders/useOrders";
import { useDeleteOrder } from "@/hooks/orders/useDeleteOrder";
import { Link } from "react-router-dom";
import { formatDate } from "@/utils/formatters";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { TableHeader, TableHead, TableBody } from "@/components/ui/table";
import OrderViewPopup from "./OrderViewPopup";

const ModernOrdersTable: React.FC = () => {
  const { data: orders, isLoading, error } = useOrders();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const [selectedOrderIdForView, setSelectedOrderIdForView] = useState<number | null>(null);

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
    if (amount === null) return "—";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getOrderTypeBadge = (orderType: string) => {
    return (
      <Badge 
        variant={orderType === "Мебель на заказ" ? "default" : "secondary"}
        className={orderType === "Мебель на заказ" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
      >
        {orderType === "Мебель на заказ" ? "На заказ" : "Готовая"}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const isCompleted = status === "Выполнен" || status === "Завершен";
    const isCancelled = status === "Отменен";
    
    return (
      <Badge 
        variant={isCompleted ? "default" : isCancelled ? "destructive" : "secondary"}
        className={isCompleted ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
      >
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ModernEmptyState
        title="Ошибка загрузки"
        description={`Не удалось загрузить заказы: ${error.message}`}
        action={{
          label: "Попробовать снова",
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <ModernEmptyState
        title="Заказы не найдены"
        description="Пока нет ни одного заказа"
        action={{
          label: "Добавить заказ",
          onClick: () => window.location.href = '/orders/new'
        }}
      />
    );
  }

  return (
    <>
      <ResponsiveTable>
        {/* Desktop Table Header */}
        <TableHeader className="hidden lg:table-header-group">
          <tr className="bg-gradient-to-r from-green-600 to-green-500 text-white">
            <TableHead className="text-white font-semibold">Номер заказа</TableHead>
            <TableHead className="text-white font-semibold">Название</TableHead>
            <TableHead className="text-white font-semibold">Тип</TableHead>
            <TableHead className="text-white font-semibold">Статус</TableHead>
            <TableHead className="text-white font-semibold">Клиент</TableHead>
            <TableHead className="text-white font-semibold">Менеджер</TableHead>
            <TableHead className="text-white font-semibold text-right">Сумма</TableHead>
            <TableHead className="text-white font-semibold">Дата создания</TableHead>
            <TableHead className="text-white font-semibold">Действия</TableHead>
          </tr>
        </TableHeader>

        <TableBody className="hidden lg:table-row-group">
          {orders.map((order) => (
            <ResponsiveRow 
              key={order.id}
              onClick={() => setSelectedOrderIdForView(order.id)}
            >
              <ResponsiveRowItem label="Номер заказа" value={order.order_number} />
              <ResponsiveRowItem label="Название" value={order.order_name || "—"} />
              <ResponsiveRowItem label="Тип" value={getOrderTypeBadge(order.order_type)} />
              <ResponsiveRowItem label="Статус" value={getStatusBadge(order.status)} />
              <ResponsiveRowItem label="Клиент" value={order.contact?.full_name || "—"} />
              <ResponsiveRowItem label="Менеджер" value={order.assigned_user?.full_name || "—"} />
              <ResponsiveRowItem label="Сумма" value={formatCurrency(order.final_amount)} />
              <ResponsiveRowItem label="Дата создания" value={formatDate(order.created_at)} />
              <ResponsiveRowItem 
                label="Действия" 
                value={
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderIdForView(order.id);
                      }}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link to={`/orders/${order.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={isDeleting}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
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
                  </div>
                } 
              />
            </ResponsiveRow>
          ))}
        </TableBody>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {orders.map((order) => (
            <ResponsiveRow 
              key={order.id}
              onClick={() => setSelectedOrderIdForView(order.id)}
            >
              <ResponsiveRowItem label="Номер заказа" value={<span className="font-semibold">{order.order_number}</span>} />
              <ResponsiveRowItem label="Название" value={order.order_name || "—"} />
              <ResponsiveRowItem label="Тип" value={getOrderTypeBadge(order.order_type)} />
              <ResponsiveRowItem label="Статус" value={getStatusBadge(order.status)} />
              <ResponsiveRowItem label="Клиент" value={order.contact?.full_name || "—"} />
              <ResponsiveRowItem label="Менеджер" value={order.assigned_user?.full_name || "—"} />
              <ResponsiveRowItem 
                label="Сумма" 
                value={<span className="font-medium text-green-600">{formatCurrency(order.final_amount)}</span>} 
              />
              <ResponsiveRowItem label="Дата создания" value={formatDate(order.created_at)} />
              <ResponsiveRowItem 
                label="Действия" 
                value={
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderIdForView(order.id);
                      }}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link to={`/orders/${order.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={isDeleting}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
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
                  </div>
                } 
              />
            </ResponsiveRow>
          ))}
        </div>
      </ResponsiveTable>

      <Dialog 
        open={!!selectedOrderIdForView} 
        onOpenChange={(isOpen) => !isOpen && setSelectedOrderIdForView(null)}
      >
        <DialogContent className="sm:max-w-[650px]">
          <OrderViewPopup orderId={selectedOrderIdForView} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModernOrdersTable;
