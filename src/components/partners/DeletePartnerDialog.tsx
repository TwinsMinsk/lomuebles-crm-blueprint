
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
import { Partner } from "@/types/partner";

interface DeletePartnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partner: Partner | null;
}

const DeletePartnerDialog: React.FC<DeletePartnerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  partner,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление партнера-изготовителя</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить этого партнера-изготовителя?
            {partner && <strong> Название: {partner.company_name}</strong>}
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

export default DeletePartnerDialog;
