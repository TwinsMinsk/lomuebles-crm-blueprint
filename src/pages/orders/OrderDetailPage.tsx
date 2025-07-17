import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderById } from "@/hooks/orders/useOrderById";
import { useDeleteOrder } from "@/hooks/orders/useDeleteOrder";
import { useUpdateOrder } from "@/hooks/orders/useUpdateOrder";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FileUploadSection } from "@/components/common/FileUploadSection";
import OrderItemsTable from "@/components/orders/OrderItemsTable";
import OrderEditForm from "@/components/orders/OrderEditForm";
import OrderNotes from "@/components/orders/OrderNotes";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { ArrowLeft, Trash2, Edit, FileText } from "lucide-react";
import CreateIncomeFromOrder from "@/components/orders/CreateIncomeFromOrder";
import EstimatesTab from "@/components/warehouse/EstimatesTab";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const { data: order, isLoading, error } = useOrderById(id ? parseInt(id) : undefined);
  const deleteOrder = useDeleteOrder();
  const { updateOrder } = useUpdateOrder();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ошибка загрузки заказа</h2>
          <p className="text-red-500">
            {error?.message || "Заказ не найден или у вас нет прав для его просмотра."}
          </p>
          <Button className="mt-4" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку заказов
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Заказ успешно удален");
      navigate("/orders");
    } catch (error) {
      toast.error("Ошибка при удалении заказа");
      console.error("Error deleting order:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setActiveTab("details");
    }
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    setActiveTab("details");
  };

  // Check if user is admin
  const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";

  // Handle file upload changes
  const handleFilesChange = async (files: any[]) => {
    if (!order) return;
    
    try {
      // Update order with the new files array
      await updateOrder({ 
        orderId: order.id, 
        orderData: { 
          attached_files_order_docs: files 
        } 
      });
      
      toast.success("Файлы успешно обновлены");
    } catch (error: any) {
      toast.error(`Ошибка при обновлении файлов: ${error.message}`);
      console.error("Error updating order files:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => navigate("/orders")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              Заказ №{order.order_number}
              {order.order_name && <span className="ml-2">- {order.order_name}</span>}
            </h1>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span className="mr-4">
                Создан: {format(new Date(order.created_at), "dd MMMM yyyy", { locale: ru })}
              </span>
              <OrderStatusBadge orderType={order.order_type} status={order.status} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <CreateIncomeFromOrder order={order} />
          )}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={handleEditToggle}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditMode ? "Отменить редактирование" : "Редактировать"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>

      {isEditMode ? (
        <OrderEditForm order={order} onSuccess={handleEditSuccess} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Детали заказа</TabsTrigger>
            <TabsTrigger value="items">Товары</TabsTrigger>
            <TabsTrigger value="estimates">Сметы и Материалы</TabsTrigger>
            <TabsTrigger value="notes">Заметки</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Основная информация</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Тип заказа:</span> {order.order_type}
                    </p>
                    <p>
                      <span className="font-medium">Статус:</span>{" "}
                      {order.status}
                    </p>
                    <p>
                      <span className="font-medium">Статус оплаты:</span>{" "}
                      {order.payment_status || "Не указан"}
                    </p>
                    <p>
                      <span className="font-medium">Сумма заказа:</span>{" "}
                      {order.final_amount ? `${order.final_amount} €` : "Не указана"}
                    </p>
                    {order.closing_date && (
                      <p>
                        <span className="font-medium">Дата закрытия:</span>{" "}
                        {format(new Date(order.closing_date), "dd MMMM yyyy", {
                          locale: ru,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Клиент</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Контакт:</span>{" "}
                      {order.contact?.full_name || "Не указан"}
                    </p>
                    <p>
                      <span className="font-medium">Телефон:</span>{" "}
                      {order.contact?.primary_phone || "Не указан"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.contact?.primary_email || "Не указан"}
                    </p>
                    <p>
                      <span className="font-medium">Компания:</span>{" "}
                      {order.company?.company_name || "Не указана"}
                    </p>
                    <p>
                      <span className="font-medium">Язык клиента:</span>{" "}
                      {order.client_language || "Не указан"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-500 mb-2">Доставка</h3>
                <p>
                  <span className="font-medium">Адрес доставки:</span>{" "}
                  {order.delivery_address_full || "Не указан"}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-500 mb-2">Ответственные</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p>
                      <span className="font-medium">Создатель:</span>{" "}
                      {order.creator?.full_name || "Не указан"}
                    </p>
                    <p>
                      <span className="font-medium">Ответственный:</span>{" "}
                      {order.assigned_user?.full_name || "Не назначен"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Партнер-изготовитель:</span>{" "}
                      {order.partner_manufacturer?.company_name || "Не указан"}
                    </p>
                    <p>
                      <span className="font-medium">Источник (лид):</span>{" "}
                      {order.source_lead ? `Лид #${order.source_lead.lead_id}` : "Не указан"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Товары в заказе</h2>
              <OrderItemsTable orderId={order.id} />
            </div>
          </TabsContent>

          <TabsContent value="estimates">
            <div className="bg-white shadow rounded-lg p-6">
              <EstimatesTab orderId={order.id} orderNumber={order.order_number} />
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Заметки и история</h2>
              <OrderNotes orderId={order.id} initialNotes={order.notes_history} />
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Файлы заказа</h2>
              <FileUploadSection
                entityType="orders"
                entityId={order.id}
                existingFiles={order.attached_files_order_docs || []}
                onFilesChange={handleFilesChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Заказ №{order.order_number} будет удален
              безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetailPage;
