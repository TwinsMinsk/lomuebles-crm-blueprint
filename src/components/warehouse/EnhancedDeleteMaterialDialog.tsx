import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, Package, Activity, Trash2, ArrowRight } from "lucide-react";
import { useMaterialDependencies } from "@/hooks/warehouse/useMaterialDependencies";
import { useEnhancedMaterialDelete } from "@/hooks/warehouse/useEnhancedMaterialDelete";
import { useDeleteMaterial } from "@/hooks/warehouse/useMaterials";
import type { Material } from "@/types/warehouse";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface EnhancedDeleteMaterialDialogProps {
  material: Material;
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedDeleteMaterialDialog = ({ material, isOpen, onClose }: EnhancedDeleteMaterialDialogProps) => {
  const [selectedCascadeOptions, setSelectedCascadeOptions] = useState<string[]>([]);
  const [showCascadeOptions, setShowCascadeOptions] = useState(false);
  
  const { data: dependencies, isLoading } = useMaterialDependencies(material.id);
  const enhancedDeleteMaterial = useEnhancedMaterialDelete();
  const simpleDeleteMaterial = useDeleteMaterial();

  const handleDeleteClick = async () => {
    console.log('Delete clicked. Has blocking dependencies:', dependencies?.hasBlockingDependencies);
    
    if (!dependencies?.hasBlockingDependencies) {
      // Use simple deletion for materials without dependencies
      try {
        console.log('Using simple delete for material:', material.id);
        await simpleDeleteMaterial.mutateAsync(material.id);
        onClose();
      } catch (error) {
        console.error("Error with simple delete:", error);
      }
    } else {
      console.log('Showing cascade options for material with dependencies');
      setShowCascadeOptions(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Confirming enhanced delete with cascade options:', selectedCascadeOptions);
      
      const cascadeOptions = {
        cancelEstimates: selectedCascadeOptions.includes('cancel-estimates'),
        clearReservations: selectedCascadeOptions.includes('clear-reservations'),
        archiveData: selectedCascadeOptions.includes('archive-data')
      };
      
      await enhancedDeleteMaterial.mutateAsync({ 
        materialId: material.id, 
        cascadeOptions 
      });
      onClose();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleCascadeOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedCascadeOptions(prev => [...prev, option]);
    } else {
      setSelectedCascadeOptions(prev => prev.filter(o => o !== option));
    }
  };

  if (isLoading) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Проверка зависимостей...</AlertDialogTitle>
          </AlertDialogHeader>
          <LoadingSkeleton className="h-48" />
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const { estimates, reservations, stockMovements, hasBlockingDependencies, canDelete } = dependencies || {};

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Удаление материала: {material.name}
          </AlertDialogTitle>
          
          {hasBlockingDependencies ? (
            <AlertDialogDescription className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Материал используется в системе и не может быть удален напрямую</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Этот материал связан с активными процессами. Просмотрите зависимости ниже и выберите действия для продолжения.
              </p>
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription>
              Вы уверены, что хотите удалить материал "{material.name}"? 
              {stockMovements?.length === 0 
                ? " У материала нет связанных записей - он будет удален безопасно."
                : " Все связанные данные будут сохранены для архивных целей."
              }
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {hasBlockingDependencies && (
          <div className="space-y-4">
            <Tabs defaultValue="estimates" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="estimates" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Сметы ({estimates?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="reservations" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Резервы ({reservations?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="movements" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Движения ({stockMovements?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="estimates" className="space-y-2">
                {estimates?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет связанных смет</p>
                ) : (
                  estimates?.map((estimate) => (
                    <div key={estimate.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{estimate.name}</p>
                        <p className="text-sm text-muted-foreground">Заказ: {estimate.order_number}</p>
                      </div>
                      <Badge variant={estimate.status === 'утверждена' ? 'destructive' : 'secondary'}>
                        {estimate.status}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="reservations" className="space-y-2">
                {reservations?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет активных резервов</p>
                ) : (
                  reservations?.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Заказ: {reservation.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Зарезервировано: {reservation.quantity_reserved} | Локация: {reservation.location}
                        </p>
                      </div>
                      <Badge variant="destructive">Активный резерв</Badge>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="movements" className="space-y-2">
                {stockMovements?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет движений материала</p>
                ) : (
                  stockMovements?.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{movement.movement_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Количество: {movement.quantity} | 
                          {movement.from_location && ` Откуда: ${movement.from_location}`}
                          {movement.to_location && ` Куда: ${movement.to_location}`}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(movement.movement_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))
                )}
                {(stockMovements?.length || 0) > 5 && (
                  <p className="text-sm text-muted-foreground">
                    И еще {(stockMovements?.length || 0) - 5} записей...
                  </p>
                )}
              </TabsContent>
            </Tabs>

            {showCascadeOptions && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Выберите действия для продолжения:</h4>
                  
                  {estimates?.some(e => e.status === 'утверждена') && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cancel-estimates"
                        checked={selectedCascadeOptions.includes('cancel-estimates')}
                        onCheckedChange={(checked) => handleCascadeOptionChange('cancel-estimates', checked as boolean)}
                      />
                      <label htmlFor="cancel-estimates" className="text-sm">
                        Отменить все утвержденные сметы
                      </label>
                    </div>
                  )}
                  
                  {(reservations?.length || 0) > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="clear-reservations"
                        checked={selectedCascadeOptions.includes('clear-reservations')}
                        onCheckedChange={(checked) => handleCascadeOptionChange('clear-reservations', checked as boolean)}
                      />
                      <label htmlFor="clear-reservations" className="text-sm">
                        Очистить все резервы материала
                      </label>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="archive-data"
                      checked={selectedCascadeOptions.includes('archive-data')}
                      onCheckedChange={(checked) => handleCascadeOptionChange('archive-data', checked as boolean)}
                    />
                    <label htmlFor="archive-data" className="text-sm">
                      Архивировать все связанные данные
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          
          {!hasBlockingDependencies ? (
            <Button 
              variant="destructive" 
              onClick={handleDeleteClick}
              disabled={simpleDeleteMaterial.isPending}
            >
              {simpleDeleteMaterial.isPending ? "Удаление..." : "Удалить материал"}
            </Button>
          ) : !showCascadeOptions ? (
            <Button 
              variant="destructive" 
              onClick={handleDeleteClick}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Просмотреть варианты
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={enhancedDeleteMaterial.isPending || selectedCascadeOptions.length === 0}
            >
              {enhancedDeleteMaterial.isPending ? "Выполнение..." : "Выполнить действия и удалить"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};