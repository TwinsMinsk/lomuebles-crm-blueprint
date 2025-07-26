import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateLocation, useUpdateLocation } from "@/hooks/warehouse/useLocations";
import type { Location, LocationFormData } from "@/hooks/warehouse/useLocations";

const locationFormSchema = z.object({
  name: z.string().min(1, "Наименование обязательно"),
  address: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  location?: Location;
}

export const LocationFormModal = ({ isOpen, onClose, mode, location }: LocationFormModalProps) => {
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: location ? {
      name: location.name,
      address: location.address || "",
      description: location.description || "",
      is_active: location.is_active,
    } : {
      name: "",
      address: "",
      description: "",
      is_active: true,
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (mode === "create") {
        await createLocation.mutateAsync(data);
      } else if (location) {
        await updateLocation.mutateAsync({ id: location.id, ...data });
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Добавить локацию" : "Редактировать локацию"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Наименование *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите наименование локации" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите адрес локации" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Описание локации" rows={3} />
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
                    <FormLabel className="text-base">Активная локация</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Неактивные локации не отображаются в списках для выбора
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
                disabled={createLocation.isPending || updateLocation.isPending}
              >
                {(createLocation.isPending || updateLocation.isPending) && "Сохранение..."}
                {!(createLocation.isPending || updateLocation.isPending) && 
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