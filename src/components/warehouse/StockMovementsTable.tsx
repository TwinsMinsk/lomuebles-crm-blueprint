import { useState } from "react";
import { StockMovementWithDetails } from "@/types/warehouse";
import { formatQuantity, formatCurrency, getMovementTypeColor } from "@/utils/warehouse";
import { formatDateInMadrid } from "@/utils/timezone";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteStockMovement } from "@/hooks/warehouse/useStockMovements";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Package, AlertCircle } from "lucide-react";
import { StockMovementFormModal } from "./StockMovementFormModal";

interface StockMovementsTableProps {
  movements: StockMovementWithDetails[];
  isLoading: boolean;
}

export const StockMovementsTable = ({ movements, isLoading }: StockMovementsTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovementWithDetails | null>(null);
  
  const { session } = useAuth();
  const { toast } = useToast();
  const deleteMovement = useDeleteStockMovement();

  const handleDeleteClick = (movementId: number) => {
    console.log('Delete button clicked for movement:', movementId);
    
    // Check session before allowing delete
    if (!session) {
      toast({
        title: "Ошибка аутентификации",
        description: "Ваша сессия истекла. Пожалуйста, войдите в систему заново.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedMovementId(movementId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Delete confirmation for movement:', selectedMovementId);
    if (selectedMovementId) {
      try {
        await deleteMovement.mutateAsync(selectedMovementId);
        console.log('Delete completed successfully');
        toast({
          title: "Успешно удалено",
          description: "Движение материала успешно удалено.",
        });
        setDeleteDialogOpen(false);
        setSelectedMovementId(null);
      } catch (error: any) {
        console.error('Delete failed:', error);
        toast({
          title: "Ошибка удаления",
          description: error.message || "Произошла ошибка при удалении записи.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditClick = (movement: StockMovementWithDetails) => {
    setEditingMovement(movement);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingMovement(null);
  };

  if (isLoading) {
    return <LoadingSkeleton className="w-full h-64" />;
  }

  if (!movements.length) {
    return (
      <ModernEmptyState
        icon={Package}
        title="Нет движений материалов"
        description="Движения материалов пока не созданы"
      />
    );
  }

  const ActionButtons = ({ movement }: { movement: StockMovementWithDetails }) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditClick(movement)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDeleteClick(movement.id)}
        disabled={deleteMovement.isPending || !session}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <ResponsiveTable>
        {/* Desktop Headers */}
        <thead className="hidden lg:table-header-group">
          <tr className="border-b">
            <th className="text-left p-4 font-medium">Дата</th>
            <th className="text-left p-4 font-medium">Материал</th>
            <th className="text-left p-4 font-medium">Тип движения</th>
            <th className="text-left p-4 font-medium">Количество</th>
            <th className="text-left p-4 font-medium">Локации</th>
            <th className="text-left p-4 font-medium">Стоимость за единицу</th>
            <th className="text-left p-4 font-medium">Общая стоимость</th>
            <th className="text-left p-4 font-medium">Поставщик</th>
            <th className="text-left p-4 font-medium">Заказ</th>
            <th className="text-left p-4 font-medium">Документ</th>
            <th className="text-left p-4 font-medium">Действия</th>
          </tr>
        </thead>
        
        <tbody>
          {movements.map((movement) => (
            <ResponsiveRow key={movement.id}>
              {/* Desktop cells */}
              <ResponsiveRowItem
                label="Дата"
                value={formatDateInMadrid(movement.movement_date)}
              />
              
              <ResponsiveRowItem
                label="Материал"
                value={
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{movement.material_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Единица: {movement.material_unit}
                      </div>
                    </div>
                  </div>
                }
                fullWidth
              />
              
              <ResponsiveRowItem
                label="Тип движения"
                value={
                  <Badge variant="outline" className={getMovementTypeColor(movement.movement_type)}>
                    {movement.movement_type}
                  </Badge>
                }
              />
              
              <ResponsiveRowItem
                label="Количество"
                value={
                  <span className="font-medium">
                    {formatQuantity(movement.quantity, movement.material_unit || 'шт')}
                  </span>
                }
              />
              
              <ResponsiveRowItem
                label="Локации"
                value={
                  <div className="text-sm">
                    {movement.movement_type === 'Перемещение' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Из:</span>
                        <span className="font-medium">{movement.from_location || '—'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-muted-foreground">В:</span>
                        <span className="font-medium">{movement.to_location || '—'}</span>
                      </div>
                    ) : movement.movement_type === 'Поступление' || movement.movement_type === 'Возврат' ? (
                      <div>
                        <span className="text-muted-foreground">→ </span>
                        <span className="font-medium">{movement.to_location || '—'}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">{movement.from_location || '—'}</span>
                        <span className="text-muted-foreground"> →</span>
                      </div>
                    )}
                  </div>
                }
              />
              
              <ResponsiveRowItem
                label="Стоимость за единицу"
                value={movement.unit_cost ? formatCurrency(movement.unit_cost) : '—'}
              />
              
              <ResponsiveRowItem
                label="Общая стоимость"
                value={movement.total_cost ? formatCurrency(movement.total_cost) : '—'}
              />
              
              <ResponsiveRowItem
                label="Поставщик"
                value={movement.supplier_name || '—'}
              />
              
              <ResponsiveRowItem
                label="Заказ"
                value={movement.order_number || '—'}
              />
              
              <ResponsiveRowItem
                label="Документ"
                value={movement.reference_document || '—'}
              />
              
              <ResponsiveRowItem
                label="Действия"
                value={<ActionButtons movement={movement} />}
              />
            </ResponsiveRow>
          ))}
        </tbody>
      </ResponsiveTable>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Подтвердите удаление
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить это движение материала? 
              Это действие нельзя отменить, и оно повлияет на складские остатки.
              {!session && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  Внимание: Ваша сессия истекла. Необходимо войти в систему заново.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteMovement.isPending}
            >
              {deleteMovement.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal */}
      {editingMovement && (
        <StockMovementFormModal
          isOpen={editModalOpen}
          onClose={handleEditClose}
          mode="edit"
          movement={{
            id: editingMovement.id,
            material_id: editingMovement.material_id,
            movement_type: editingMovement.movement_type,
            quantity: editingMovement.quantity,
            unit_cost: editingMovement.unit_cost,
            reference_document: editingMovement.reference_document,
            notes: editingMovement.notes,
            supplier_id: editingMovement.supplier_id,
            order_id: editingMovement.order_id,
            movement_date: editingMovement.movement_date,
            from_location: editingMovement.from_location,
            to_location: editingMovement.to_location,
          }}
        />
      )}
    </>
  );
};