
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
import { Company } from "@/hooks/useCompanies";

interface DeleteCompanyDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCompanyDialog: React.FC<DeleteCompanyDialogProps> = ({
  company,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!company) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить компанию</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Вы действительно хотите удалить эту компанию?</p>
            <p className="font-medium">Название: {company.company_name}</p>
            <p className="text-destructive">
              Все связанные контакты и заказы потеряют связь с этой компанией, если не предусмотрена логика перепривязки или архивации.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Отмена</AlertDialogCancel>
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

export default DeleteCompanyDialog;
