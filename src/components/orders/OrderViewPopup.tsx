
import React from "react";
import { useNavigate } from "react-router-dom";
import { useOrderById } from "@/hooks/orders/useOrders";
import { formatDate, formatCurrency } from "@/utils/formatters";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, ExternalLink } from "lucide-react";

interface OrderViewPopupProps {
  orderId: number | null;
}

const OrderViewPopup: React.FC<OrderViewPopupProps> = ({ orderId }) => {
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderById(orderId || 0);
  
  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 text-center text-red-500">
        Ошибка загрузки данных заказа
      </div>
    );
  }

  const handleEditClick = () => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          <span>Заказ #{order.order_number}</span>
          {order.order_name && <span className="text-muted-foreground">({order.order_name})</span>}
        </DialogTitle>
      </DialogHeader>
      
      <div className="py-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Тип заказа</p>
            <p>{order.order_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Статус</p>
            <p>{order.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Клиент</p>
            <p>{order.contact_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Компания</p>
            <p>{order.company_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Менеджер</p>
            <p>{order.assigned_user_name || "Не назначен"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Сумма</p>
            <p className="font-medium">
              {order.final_amount !== null ? formatCurrency(order.final_amount) : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Статус оплаты</p>
            <p>{order.payment_status || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Язык клиента</p>
            <p>{order.client_language}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Адрес доставки</p>
            <p>{order.delivery_address_full || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Дата создания</p>
            <p>{formatDate(order.created_at)}</p>
          </div>
        </div>
        
        {order.notes_history && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Заметки</p>
            <div className="bg-muted/50 p-2 rounded-md text-sm">
              {order.notes_history}
            </div>
          </div>
        )}
        
        {order.attached_files_order_docs && order.attached_files_order_docs.length > 0 && (
          <div className="mb-4">
            <Separator className="my-4" />
            <p className="text-sm font-medium mb-2">Прикрепленные файлы</p>
            <div className="space-y-2">
              {order.attached_files_order_docs.map((file: any, index: number) => (
                <a 
                  key={index} 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span className="flex-grow truncate">{file.name}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button">
          Закрыть
        </Button>
        <Button onClick={handleEditClick}>
          Редактировать
        </Button>
      </DialogFooter>
    </>
  );
};

export default OrderViewPopup;
