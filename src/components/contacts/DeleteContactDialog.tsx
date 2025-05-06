
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
import { ContactWithRelations } from "./ContactTableRow";

interface DeleteContactDialogProps {
  isOpen: boolean;
  contact: ContactWithRelations | null;
  onClose: () => void;
  onConfirm: (contactId: number) => void;
  isDeleting: boolean;
}

const DeleteContactDialog: React.FC<DeleteContactDialogProps> = ({
  isOpen,
  contact,
  onClose,
  onConfirm,
  isDeleting
}) => {
  if (!contact) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление контакта</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить этот контакт? ФИО:{" "}
            <strong>{contact.full_name}</strong>
            <br /><br />
            Связанные с ним данные (например, заказы) не будут удалены, но могут потерять связь с этим контактом, если не предусмотрена логика архивации.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(contact.contact_id)}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteContactDialog;
