
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionCategory, TransactionCategoryFormData } from "@/hooks/finance/useTransactionCategories";

const categorySchema = z.object({
  name: z.string().min(1, "Название категории обязательно"),
  type: z.enum(["income", "expense"], {
    required_error: "Необходимо выбрать тип категории",
  }),
  description: z.string().optional().nullable(),
});

interface CategoryFormProps {
  onSubmit: (data: TransactionCategoryFormData) => void;
  initialData?: TransactionCategory;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  isSubmitting,
}) => {
  const form = useForm<TransactionCategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "income",
      description: initialData?.description || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название категории *</FormLabel>
              <FormControl>
                <Input placeholder="Введите название категории" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип категории *</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Доход</SelectItem>
                    <SelectItem value="expense">Расход</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea
                  placeholder="Введите описание категории (необязательно)"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : initialData ? "Обновить" : "Создать"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
