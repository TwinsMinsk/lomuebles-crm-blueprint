import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useEstimateById, useUpdateEstimate, useAddEstimateItem, useUpdateEstimateItem, useDeleteEstimateItem } from "@/hooks/warehouse/useEstimates";
import { useMaterials } from "@/hooks/warehouse/useMaterials";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";

interface EstimateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: number | null;
  orderId: number;
  orderNumber: string;
  readOnly?: boolean;
}

const EstimateFormModal: React.FC<EstimateFormModalProps> = ({
  isOpen,
  onClose,
  estimateId,
  orderId,
  orderNumber,
  readOnly = false,
}) => {
  const [estimateName, setEstimateName] = useState("");
  const [estimateStatus, setEstimateStatus] = useState("черновик");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  const { data: estimate, isLoading: estimateLoading } = useEstimateById(estimateId || undefined);
  const { data: materials = [] } = useMaterials();
  const updateEstimate = useUpdateEstimate();
  const addEstimateItem = useAddEstimateItem();
  const updateEstimateItem = useUpdateEstimateItem();
  const deleteEstimateItem = useDeleteEstimateItem();

  // Update form fields when estimate data changes
  useEffect(() => {
    if (estimate) {
      setEstimateName(estimate.name || "");
      setEstimateStatus(estimate.status);
    }
  }, [estimate]);

  const handleSaveEstimate = async () => {
    if (!estimateId) return;

    try {
      await updateEstimate.mutateAsync({
        estimateId,
        updates: {
          name: estimateName,
          status: estimateStatus,
        },
      });
    } catch (error) {
      console.error("Error saving estimate:", error);
    }
  };

  const handleAddMaterial = async () => {
    if (!estimateId || !selectedMaterialId || newItemQuantity <= 0) {
      toast.error("Выберите материал и укажите количество");
      return;
    }

    const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
    if (!selectedMaterial) return;

    try {
      await addEstimateItem.mutateAsync({
        estimate_id: estimateId,
        material_id: selectedMaterialId,
        quantity_needed: newItemQuantity,
        price_at_estimation: selectedMaterial.current_cost || 0,
      });

      // Reset form
      setSelectedMaterialId(null);
      setNewItemQuantity(1);
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      toast.error("Количество должно быть больше нуля");
      return;
    }

    try {
      await updateEstimateItem.mutateAsync({
        itemId,
        updates: { quantity_needed: newQuantity },
      });
      setEditingItemId(null);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteEstimateItem.mutateAsync(itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const materialOptions = materials
    .filter(material => material.is_active)
    .map(material => ({
      value: material.id.toString(),
      label: `${material.name} (${material.current_cost || 0}€/${material.unit})`,
    }));

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Смета для Заказа №{orderNumber}
            {estimate && (
              <Badge className="ml-2" variant={estimate.status === 'утверждена' ? 'default' : 'secondary'}>
                {estimate.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {estimateLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estimate Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimate-name">Название сметы</Label>
                <Input
                  id="estimate-name"
                  value={estimateName}
                  onChange={(e) => setEstimateName(e.target.value)}
                  placeholder="Введите название сметы"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="estimate-status">Статус</Label>
                <Select value={estimateStatus} onValueChange={setEstimateStatus} disabled={readOnly}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="черновик">Черновик</SelectItem>
                    <SelectItem value="утверждена">Утверждена</SelectItem>
                    <SelectItem value="отменена">Отменена</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Material Section */}
            {!readOnly && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Добавить материал</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="material-select">Материал</Label>
                    <Combobox
                      options={materialOptions}
                      value={selectedMaterialId?.toString() || ""}
                      onValueChange={(value) => setSelectedMaterialId(value ? parseInt(value) : null)}
                      placeholder="Поиск материала..."
                      emptyText="Материалы не найдены"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="quantity">Количество</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    onClick={handleAddMaterial}
                    disabled={!selectedMaterialId || newItemQuantity <= 0 || addEstimateItem.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              </div>
            )}

            {/* Estimate Items Table */}
            <div>
              <h3 className="font-medium mb-4">Позиции сметы</h3>
              {estimate?.estimate_items && estimate.estimate_items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Материал</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Количество</TableHead>
                        <TableHead>Цена за ед.</TableHead>
                        <TableHead>Итого</TableHead>
                        {!readOnly && <TableHead className="w-[100px]">Действия</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimate.estimate_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.material?.name || "Неизвестный материал"}
                          </TableCell>
                          <TableCell>{item.material?.category || "-"}</TableCell>
                          <TableCell>
                            {editingItemId === item.id && !readOnly ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={editingQuantity}
                                  onChange={(e) => setEditingQuantity(parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateQuantity(item.id, editingQuantity)}
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingItemId(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className={`${!readOnly ? "cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" : ""}`}
                                onClick={() => {
                                  if (!readOnly) {
                                    setEditingItemId(item.id);
                                    setEditingQuantity(item.quantity_needed);
                                  }
                                }}
                              >
                                {item.quantity_needed} {item.material?.unit || "шт"}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {(item.price_at_estimation || item.material?.current_cost || 0).toFixed(2)}€
                          </TableCell>
                          <TableCell>
                            {(
                              item.quantity_needed * 
                              (item.price_at_estimation || item.material?.current_cost || 0)
                            ).toFixed(2)}€
                          </TableCell>
                          {!readOnly && (
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border rounded-lg">
                  Позиции в смете отсутствуют
                </div>
              )}

              {/* Total Cost */}
              {estimate && (
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Общая стоимость: {(estimate.total_cost || 0).toFixed(2)}€
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
              {!readOnly && (
                <Button onClick={handleSaveEstimate} disabled={updateEstimate.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EstimateFormModal;