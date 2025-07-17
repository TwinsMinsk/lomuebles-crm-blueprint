import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useEstimatesByOrderId, useDeleteEstimate, useCreateEstimate } from "@/hooks/warehouse/useEstimates";
import { useAuth } from "@/context/AuthContext";
import EstimateFormModal from "./EstimateFormModal";
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

interface EstimatesTabProps {
  orderId: number;
  orderNumber: string;
}

const EstimatesTab: React.FC<EstimatesTabProps> = ({ orderId, orderNumber }) => {
  const { userRole } = useAuth();
  const [selectedEstimateId, setSelectedEstimateId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteEstimateId, setDeleteEstimateId] = useState<number | null>(null);

  const { data: estimates = [], isLoading } = useEstimatesByOrderId(orderId);
  const createEstimate = useCreateEstimate();
  const deleteEstimate = useDeleteEstimate();

  const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";
  const canManageEstimates = isAdmin || userRole === "Менеджер";

  const handleCreateEstimate = async () => {
    try {
      const newEstimate = await createEstimate.mutateAsync({ order_id: orderId });
      setSelectedEstimateId(newEstimate.id);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating estimate:", error);
    }
  };

  const handleViewEstimate = (estimateId: number) => {
    setSelectedEstimateId(estimateId);
    setIsModalOpen(true);
  };

  const handleDeleteEstimate = async () => {
    if (!deleteEstimateId) return;
    try {
      await deleteEstimate.mutateAsync(deleteEstimateId);
      setDeleteEstimateId(null);
    } catch (error) {
      console.error("Error deleting estimate:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "черновик":
        return "secondary";
      case "утверждена":
        return "default";
      case "отменена":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Сметы для заказа №{orderNumber}</h2>
        {canManageEstimates && (
          <Button 
            onClick={handleCreateEstimate} 
            disabled={createEstimate.isPending}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать новую смету
          </Button>
        )}
      </div>

      {estimates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Смет для этого заказа пока нет</p>
          {canManageEstimates && (
            <Button 
              onClick={handleCreateEstimate} 
              disabled={createEstimate.isPending}
              className="mt-4"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать первую смету
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {estimates.map((estimate) => (
            <div
              key={estimate.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">
                      {estimate.name || `Смета #${estimate.id}`}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(estimate.status)}>
                      {estimate.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Итоговая стоимость:</span>{" "}
                      {estimate.total_cost ? `${estimate.total_cost.toFixed(2)} €` : "Не рассчитана"}
                    </p>
                    <p>
                      <span className="font-medium">Позиций в смете:</span>{" "}
                      {estimate.estimate_items?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium">Создана:</span>{" "}
                      {new Date(estimate.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEstimate(estimate.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {canManageEstimates ? "Редактировать" : "Просмотр"}
                  </Button>
                  {canManageEstimates && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteEstimateId(estimate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estimate Form Modal */}
      <EstimateFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEstimateId(null);
        }}
        estimateId={selectedEstimateId}
        orderId={orderId}
        orderNumber={orderNumber}
        readOnly={!canManageEstimates}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteEstimateId !== null} 
        onOpenChange={() => setDeleteEstimateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Смета и все её позиции будут удалены безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEstimate} 
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteEstimate.isPending}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EstimatesTab;