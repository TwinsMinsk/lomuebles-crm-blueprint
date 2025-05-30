import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useTransactionCategories } from "@/hooks/finance/useTransactionCategories";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, TransactionFormData } from "@/hooks/finance/useTransactions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TransactionCategorySelector from "./form-selectors/TransactionCategorySelector";
import TransactionOrderSelector from "./form-selectors/TransactionOrderSelector";
import TransactionFileUpload from "./TransactionFileUpload";

// Define schema for the form
const transactionFormSchema = z.object({
  transaction_date: z.date({
    required_error: "Дата обязательна",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "Выберите тип операции",
  }),
  category_id: z.coerce.number({
    required_error: "Выберите категорию",
    invalid_type_error: "Категория должна быть выбрана",
  }).positive({ message: "Категория должна быть выбрана"}),
  amount: z.coerce.number({
    required_error: "Введите сумму",
    invalid_type_error: "Сумма должна быть числом",
  }).positive({ message: "Сумма должна быть больше 0" }),
  currency: z.string().default("EUR"),
  description: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  related_order_id: z.coerce.number().optional().nullable(),
  related_contact_id: z.coerce.number().optional().nullable(),
  related_supplier_id: z.coerce.number().optional().nullable(),
  related_partner_manufacturer_id: z.coerce.number().optional().nullable(),
  related_user_id: z.string().uuid().optional().nullable(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export interface TransactionFormProps {
  transaction?: Transaction;
  initialData?: Partial<TransactionFormData>;
  onSuccess: (data: TransactionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  initialData,
  onSuccess,
  onCancel,
  isSubmitting = false,
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>(transaction?.attached_files || initialData?.attached_files || []);
  
  // Fetch related entities
  const { data: contactsData, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["contacts-simple-for-transaction"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("contact_id, full_name").order("full_name");
      if (error) { console.error("Error fetching contacts:", error); throw error; }
      return data || [];
    }
  });
  
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders-simple-for-transaction"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, order_number, order_name").order("order_number", { ascending: false });
      if (error) { console.error("Error fetching orders:", error); throw error; }
      console.log("Fetched orders data:", data);
      return data || [];
    }
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useTransactionCategories();
  
  // Ensure we have arrays even if the data is undefined
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData.filter(Boolean) : [];
  
  console.log("Orders array:", orders);
  console.log("Categories array:", categories);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transaction_date: transaction?.transaction_date ? new Date(transaction.transaction_date) : initialData?.transaction_date ? new Date(initialData.transaction_date) : new Date(),
      type: transaction?.type || initialData?.type || "income",
      category_id: transaction?.category_id || initialData?.category_id || undefined,
      amount: transaction?.amount || initialData?.amount || undefined,
      currency: transaction?.currency || initialData?.currency || "EUR",
      description: transaction?.description || initialData?.description || "",
      payment_method: transaction?.payment_method || initialData?.payment_method || "",
      related_order_id: transaction?.related_order_id || initialData?.related_order_id || undefined,
    },
  });

  const currentType = form.watch("type");

  // useEffect for resetting category_id when type changes
  useEffect(() => {
    if (currentType) {
      const selectedCategory = categories.find(cat => cat.id === form.getValues("category_id"));
      if (selectedCategory && selectedCategory.type !== currentType) {
          form.setValue("category_id", undefined, { shouldValidate: true });
      }
    }
  }, [currentType, form, categories]);

  const handleFilesChange = (newFiles: any[]) => {
    setFiles(newFiles);
  };

  const isDataLoading = isLoadingCategories || isLoadingContacts || isLoadingOrders;

  const onSubmitHandler = async (data: TransactionFormValues) => {
    try {
      const fullData: TransactionFormData = {
        ...data,
        transaction_date: data.transaction_date,
        type: data.type,
        category_id: Number(data.category_id),
        amount: Number(data.amount),
        currency: data.currency || 'EUR',
        related_order_id: data.related_order_id ? Number(data.related_order_id) : null,
        related_contact_id: data.related_contact_id ? Number(data.related_contact_id) : null,
        related_supplier_id: data.related_supplier_id ? Number(data.related_supplier_id) : null,
        related_partner_manufacturer_id: data.related_partner_manufacturer_id ? Number(data.related_partner_manufacturer_id) : null,
        related_user_id: data.related_user_id || null,
        attached_files: files,
      };
      
      console.log('Submitting transaction with files:', fullData.attached_files);
      onSuccess(fullData);
    } catch (error) {
      console.error('Error submitting transaction form:', error);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>

            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата операции*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "d MMMM yyyy", { locale: ru })
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
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип операции*</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Доход</SelectItem>
                      <SelectItem value="expense">Расход</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория*</FormLabel>
                  <FormControl>
                    <TransactionCategorySelector
                      value={field.value}
                      onChange={(value) => {
                        console.log("TransactionCategorySelector onChange called with:", value);
                        field.onChange(value);
                      }}
                      categories={categories}
                      type={currentType}
                      isLoading={isLoadingCategories}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Валюта</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Способ оплаты</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите способ оплаты" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Наличные">Наличные</SelectItem>
                      <SelectItem value="Карта">Карта</SelectItem>
                      <SelectItem value="Банковский перевод">Банковский перевод</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Другое">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Related Entities and Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Связанные объекты и описание</h3>
            
            <FormField
              control={form.control}
              name="related_order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Связанный заказ</FormLabel>
                  <FormControl>
                    <TransactionOrderSelector
                      value={field.value}
                      onChange={(value) => {
                        console.log("TransactionOrderSelector onChange called with:", value);
                        field.onChange(value);
                      }}
                      orders={orders}
                      isLoading={isLoadingOrders}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Прикрепленные файлы</FormLabel>
              <TransactionFileUpload
                transactionId={transaction?.id}
                existingFiles={files}
                onFilesChange={handleFilesChange}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Детальное описание операции..."
                      className="resize-none min-h-[120px]"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                {transaction ? "Обновление..." : "Создание..."}
              </div>
            ) : (
              transaction ? "Обновить операцию" : "Создать операцию"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
