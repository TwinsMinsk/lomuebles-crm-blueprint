import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteMaterial } from "@/hooks/warehouse/useMaterials";
import type { Material } from "@/types/warehouse";

interface DeleteMaterialDialogProps {
  material: Material;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteMaterialDialog = ({ material, isOpen, onClose }: DeleteMaterialDialogProps) => {
  const deleteMaterial = useDeleteMaterial();

  const handleDelete = async () => {
    try {
      await deleteMaterial.mutateAsync(material.id);
      onClose();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить материал?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить материал "{material.name}"? 
            Это действие необратимо и может повлиять на связанные записи о движениях и остатках.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMaterial.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMaterial.isPending ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};