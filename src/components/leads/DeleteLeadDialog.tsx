
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
import { LeadWithProfile } from "./LeadTableRow";

interface DeleteLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lead: LeadWithProfile | null;
}

const DeleteLeadDialog: React.FC<DeleteLeadDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lead,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление лида</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить этот лид?
            {lead && <strong> Имя лида: {lead.name || 'Без имени'}</strong>}
            <br />
            Это действие необратимо.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLeadDialog;
