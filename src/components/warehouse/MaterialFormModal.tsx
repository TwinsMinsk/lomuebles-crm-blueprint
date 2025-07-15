import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useCreateMaterial, useUpdateMaterial } from "@/hooks/warehouse/useMaterials";
import { MATERIAL_CATEGORIES, MATERIAL_UNITS } from "@/types/warehouse";
import type { Material, MaterialFormData } from "@/types/warehouse";

const materialFormSchema = z.object({
  name: z.string().min(1, "Наименование обязательно"),
  description: z.string().optional(),
  category: z.enum(MATERIAL_CATEGORIES as [string, ...string[]]),
  unit: z.enum(MATERIAL_UNITS as [string, ...string[]]),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  min_stock_level: z.number().min(0, "Минимальный остаток не может быть отрицательным"),
  max_stock_level: z.number().optional(),
  current_cost: z.number().optional(),
  supplier_id: z.number().optional(),
  is_active: z.boolean().default(true),
});

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  material?: Material;
}

export const MaterialFormModal = ({ isOpen, onClose, mode, material }: MaterialFormModalProps) => {
  const { data: suppliersData } = useSuppliers({
    page: 1,
    limit: 100,
    searchQuery: "",
    category: null
  });
  const suppliers = suppliersData?.suppliers || [];
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: material ? {
      name: material.name,
      description: material.description || "",
      category: material.category,
      unit: material.unit,
      sku: material.sku || "",
      barcode: material.barcode || "",
      min_stock_level: material.min_stock_level,
      max_stock_level: material.max_stock_level || undefined,
      current_cost: material.current_cost || undefined,
      supplier_id: material.supplier_id || undefined,
      is_active: material.is_active,
    } : {
      name: "",
      description: "",
      category: MATERIAL_CATEGORIES[0],
      unit: MATERIAL_UNITS[0],
      sku: "",
      barcode: "",
      min_stock_level: 0,
      is_active: true,
    },
  });

  const onSubmit = async (data: MaterialFormData) => {
    try {
      if (mode === "create") {
        await createMaterial.mutateAsync(data);
      } else if (material) {
        await updateMaterial.mutateAsync({ id: material.id, ...data });
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving material:", error);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Добавить материал" : "Редактировать материал"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Наименование *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Введите наименование материала" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATERIAL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Единица измерения *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите единицу" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATERIAL_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
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
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Артикул материала" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Штрихкод</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Штрихкод материала" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Минимальный остаток *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="max_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Максимальный остаток</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Не ограничен"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текущая стоимость (€)</FormLabel>
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
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Поставщик</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите поставщика" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Без поставщика</SelectItem>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Описание материала" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Активный материал</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Неактивные материалы не отображаются в списках для выбора
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createMaterial.isPending || updateMaterial.isPending}
              >
                {(createMaterial.isPending || updateMaterial.isPending) && "Сохранение..."}
                {!(createMaterial.isPending || updateMaterial.isPending) && 
                  (mode === "create" ? "Создать" : "Сохранить")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};