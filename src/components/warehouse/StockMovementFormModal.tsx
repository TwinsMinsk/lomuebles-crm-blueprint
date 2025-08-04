
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fromMadridTimeToUTC, toMadridTime } from "@/utils/timezone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMaterials } from "@/hooks/warehouse/useMaterials";
import { useLocations } from "@/hooks/warehouse/useLocations";
import { useCreateStockMovement, useUpdateStockMovement } from "@/hooks/warehouse/useStockMovements";
import { useOrders } from "@/hooks/orders/useOrders";
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
  from_location: z.string().optional(),
  to_location: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.movement_type === "Перемещение") {
    if (!data.from_location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Откуда обязательно для перемещения",
        path: ["from_location"],
      });
    }
    if (!data.to_location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Куда обязательно для перемещения",
        path: ["to_location"],
      });
    }
    if (data.from_location === data.to_location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Локации откуда и куда должны отличаться",
        path: ["to_location"],
      });
    }
  }
  
  if (data.movement_type === "Поступление" && !data.to_location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Локация назначения обязательна для поступления",
      path: ["to_location"],
    });
  }
  
  if (data.movement_type === "Расход" && !data.from_location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Локация списания обязательна для расхода",
      path: ["from_location"],
    });
  }
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
  const { data: locations } = useLocations();
  const { data: orders } = useOrders();
  const createMovement = useCreateStockMovement();
  const updateMovement = useUpdateStockMovement();

  // Filter active orders for selection
  const activeOrders = orders?.filter(order => 
    order.status && !['Завершен', 'Отменен'].includes(order.status)
  ) || [];

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: {
      material_id: 0, // Это значение не пройдет валидацию - будет показана ошибка
      movement_type: STOCK_MOVEMENT_TYPES[0],
      quantity: 0, // Это значение не пройдет валидацию - будет показана ошибка
      reference_document: "",
      notes: "",
      movement_date: toMadridTime(new Date()).toISOString().split('T')[0],
      from_location: "",
      to_location: "",
    },
  });

  const movementType = useWatch({
    control: form.control,
    name: "movement_type",
  });

  // Pre-fill form when editing
  useEffect(() => {
    console.log('StockMovementFormModal: useEffect triggered', { mode, movement });
    if (mode === "edit" && movement) {
      console.log('Setting form values for edit mode:', movement);
      form.reset({
        material_id: movement.material_id,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        unit_cost: movement.unit_cost,
        reference_document: movement.reference_document || "",
        notes: movement.notes || "",
        supplier_id: movement.supplier_id,
        order_id: movement.order_id,
        movement_date: movement.movement_date ? toMadridTime(movement.movement_date).toISOString().split('T')[0] : toMadridTime(new Date()).toISOString().split('T')[0],
        from_location: movement.from_location || "",
        to_location: movement.to_location || "",
      });
    } else if (mode === "create") {
      console.log('Resetting form for create mode');
      form.reset({
        material_id: 0,
        movement_type: STOCK_MOVEMENT_TYPES[0],
        quantity: 0,
        reference_document: "",
        notes: "",
        movement_date: toMadridTime(new Date()).toISOString().split('T')[0],
        from_location: "",
        to_location: "",
      });
    }
  }, [mode, movement, form]);

  const onSubmit = async (data: StockMovementFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form validation state:', form.formState);
    console.log('Form errors:', form.formState.errors);
    
    try {
      // Convert the date string to UTC before submitting
      const processedData = {
        ...data,
        movement_date: data.movement_date ? 
          fromMadridTimeToUTC(new Date(`${data.movement_date}T12:00:00`)).toISOString() :
          undefined
      };
      
      console.log('Calling movement mutation with processed data:', processedData);
      
      if (mode === "edit" && movement) {
        console.log('Editing movement with id:', movement.id);
        await updateMovement.mutateAsync({ ...processedData, id: movement.id });
      } else {
        console.log('Creating new movement');
        await createMovement.mutateAsync(processedData);
      }
      
      console.log('Movement operation successful, closing modal');
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      // Дополнительная информация об ошибке
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      console.error('Full error object:', JSON.stringify(error, null, 2));
    }
  };

  const handleClose = () => {
    console.log('Modal closing, resetting form');
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
          <DialogDescription>
            Заполните форму для {mode === "edit" ? "редактирования" : "создания"} движения материала на складе.
          </DialogDescription>
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
                    <Select 
                      onValueChange={(value) => {
                        console.log('Material selected:', value);
                        field.onChange(Number(value));
                      }} 
                      value={field.value > 0 ? field.value.toString() : ""}
                    >
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
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : 0;
                          console.log('Quantity changed:', value);
                          field.onChange(value);
                        }}
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

              <FormField
                control={form.control}
                name="order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный заказ</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "__none__" ? undefined : (value ? Number(value) : undefined))} 
                      value={field.value?.toString() || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите заказ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Без заказа</SelectItem>
                        {activeOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {order.order_name || `Заказ ${order.order_number}`}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {order.contact?.full_name} • {order.status}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location fields */}
            {(movementType === "Перемещение" || movementType === "Поступление" || movementType === "Расход") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(movementType === "Перемещение" || movementType === "Расход") && (
                  <FormField
                    control={form.control}
                    name="from_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {movementType === "Перемещение" ? "Откуда *" : "Локация списания *"}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите локацию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations?.map((location) => (
                              <SelectItem key={location.id} value={location.name}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(movementType === "Перемещение" || movementType === "Поступление") && (
                  <FormField
                    control={form.control}
                    name="to_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {movementType === "Перемещение" ? "Куда *" : "Локация поступления *"}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите локацию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations?.map((location) => (
                              <SelectItem key={location.id} value={location.name}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

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
