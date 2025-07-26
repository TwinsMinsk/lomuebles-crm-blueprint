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
import { useDeleteLocation } from "@/hooks/warehouse/useLocations";
import type { Location } from "@/hooks/warehouse/useLocations";

interface DeleteLocationDialogProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteLocationDialog = ({ location, isOpen, onClose }: DeleteLocationDialogProps) => {
  const deleteLocation = useDeleteLocation();

  const handleDelete = async () => {
    try {
      await deleteLocation.mutateAsync(location.id);
      onClose();
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить локацию</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить локацию "{location.name}"? 
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteLocation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteLocation.isPending ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};