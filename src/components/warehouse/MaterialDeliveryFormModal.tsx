import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MaterialDeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  deliveryId?: number;
}

export const MaterialDeliveryFormModal = ({ isOpen, onClose, mode }: MaterialDeliveryFormModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Добавить поставку" : "Редактировать поставку"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Форма создания/редактирования поставки будет реализована позже</p>
          <Button onClick={onClose} className="mt-4">Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};