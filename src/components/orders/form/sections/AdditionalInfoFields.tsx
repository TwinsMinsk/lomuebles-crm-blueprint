
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { OrderFormValues } from "../orderFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<OrderFormValues>;
}

export const AdditionalInfoFields: React.FC<AdditionalInfoFieldsProps> = ({ form }) => {
  return (
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="deliveryAddressFull"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Полный адрес доставки/замера/монтажа</FormLabel>
            <FormControl>
              <Textarea 
                {...field}
                value={field.value || ""}
                placeholder="Введите полный адрес"
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notesHistory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>История изменений и комментарии</FormLabel>
            <FormControl>
              <Textarea 
                {...field}
                value={field.value || ""}
                placeholder="Здесь хранится история изменений и комментарии к заказу"
                className="min-h-[150px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="closingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Дата закрытия заказа</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "dd.MM.yyyy")
                    ) : (
                      <span>Выберите дату</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Here we would add file upload component for attachedFilesOrderDocs */}
      {/* This will be a placeholder until we implement file uploads */}
      <FormItem>
        <FormLabel>Прикрепленные файлы по заказу</FormLabel>
        <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Функционал загрузки файлов будет реализован в следующем этапе
          </p>
        </div>
      </FormItem>
    </div>
  );
};
