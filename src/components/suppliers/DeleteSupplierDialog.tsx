
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
import { Supplier } from "@/types/supplier";

interface DeleteSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supplier: Supplier | null;
}

const DeleteSupplierDialog: React.FC<DeleteSupplierDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  supplier,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление поставщика</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить этого поставщика?
            {supplier && <strong> Название: {supplier.supplier_name}</strong>}
            <br />
            Это действие необратимо.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSupplierDialog;
