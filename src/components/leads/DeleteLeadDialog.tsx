
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
import { Loader2 } from "lucide-react";

interface DeleteLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lead: LeadWithProfile | null;
  isDeleting?: boolean;
}

const DeleteLeadDialog: React.FC<DeleteLeadDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lead,
  isDeleting = false,
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
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLeadDialog;
