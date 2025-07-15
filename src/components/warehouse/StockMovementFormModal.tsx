import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMaterials } from "@/hooks/warehouse/useMaterials";
import { useCreateStockMovement, useUpdateStockMovement } from "@/hooks/warehouse/useStockMovements";
import { STOCK_MOVEMENT_TYPES } from "@/types/warehouse";
import type { StockMovementFormData } from "@/types/warehouse";
import { useEffect } from "react";

const stockMovementFormSchema = z.object({
  material_id: z.number().min(1, "Материал обязателен"),
  movement_type: z.enum(STOCK_MOVEMENT_TYPES as [string, ...string[]]),
  quantity: z.number().min(0.01, "Количество должно быть больше 0"),
  unit_cost: z.number().optional(),
  reference_document: z.string().optional(),
  notes: z.string().optional(),
  supplier_id: z.number().optional(),
  order_id: z.number().optional(),
  movement_date: z.string().optional(),
});

interface StockMovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  movement?: StockMovementFormData & { id: number };
}

export const StockMovementFormModal = ({ isOpen, onClose, mode, movement }: StockMovementFormModalProps) => {
  const { data: suppliersData } = useSuppliers({
    page: 1,
    limit: 100,
    searchQuery: "",
    category: null
  });
  const suppliers = suppliersData?.suppliers || [];
  const { data: materials } = useMaterials();
  const createMovement = useCreateStockMovement();
  const updateMovement = useUpdateStockMovement();

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: {
      material_id: 0,
      movement_type: STOCK_MOVEMENT_TYPES[0],
      quantity: 0,
      reference_document: "",
      notes: "",
      movement_date: new Date().toISOString().split('T')[0],
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (mode === "edit" && movement) {
      form.reset({
        material_id: movement.material_id,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        unit_cost: movement.unit_cost,
        reference_document: movement.reference_document || "",
        notes: movement.notes || "",
        supplier_id: movement.supplier_id,
        order_id: movement.order_id,
        movement_date: movement.movement_date ? new Date(movement.movement_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else if (mode === "create") {
      form.reset({
        material_id: 0,
        movement_type: STOCK_MOVEMENT_TYPES[0],
        quantity: 0,
        reference_document: "",
        notes: "",
        movement_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [mode, movement, form]);

  const onSubmit = async (data: StockMovementFormData) => {
    try {
      if (mode === "edit" && movement) {
        await updateMovement.mutateAsync({ ...data, id: movement.id });
      } else {
        await createMovement.mutateAsync(data);
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving stock movement:", error);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const isLoading = createMovement.isPending || updateMovement.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Редактировать движение материала" : "Добавить движение материала"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="material_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Материал *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите материал" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials?.map((material) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.name} ({material.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="movement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип движения *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STOCK_MOVEMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Стоимость за единицу (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="movement_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата движения</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер документа</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Номер накладной, счета и т.д." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Поставщик</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "__none__" ? undefined : (value ? Number(value) : undefined))} value={field.value?.toString() || "__none__"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите поставщика" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Без поставщика</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.supplier_id} value={supplier.supplier_id.toString()}>
                            {supplier.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечания</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Дополнительная информация" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Сохранение..." : (mode === "edit" ? "Обновить" : "Создать")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};