
import React from "react";
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
import { useDeleteOrder } from "@/hooks/orders/useDeleteOrder";

interface DeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId: number;
}

const DeleteOrderDialog: React.FC<DeleteOrderDialogProps> = ({
  isOpen,
  onClose,
  orderNumber,
  orderId,
}) => {
  const { deleteOrder, isDeleting } = useDeleteOrder();

  const handleConfirmDelete = async () => {
    await deleteOrder(orderId);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление заказа</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить этот заказ?
            <br />
            <strong>Номер заказа: {orderNumber}</strong>
            <br />
            <br />
            Это действие также удалит все связанные с ним позиции заказа (OrderItems).
            <br />
            Это действие необратимо.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOrderDialog;
