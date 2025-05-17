import React, { useState, useEffect } from "react"; // Добавил useEffect для примера ниже
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
// Важно: Добавляем CommandList
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"; // Добавил Loader2 для примера
import { cn } from "@/lib/utils";
import { Transaction, TransactionFormData } from "@/hooks/finance/useTransactions"; // Убедитесь, что этот тип существует и корректен
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadSection } from "@/components/common/FileUploadSection";

// Define schema for the form
const transactionFormSchema = z.object({
  transaction_date: z.date({
    required_error: "Дата обязательна",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "Выберите тип операции",
  }),
  category_id: z.coerce.number({ // Используем coerce.number для преобразования из строки, если Select возвращает строку
    required_error: "Выберите категорию",
    invalid_type_error: "Категория должна быть выбрана",
  }).positive({ message: "Категория должна быть выбрана"}),
  amount: z.coerce.number({ // Используем coerce.number
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
  transaction?: Transaction; // Предполагаем, что Transaction - это тип из вашей БД
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
  const [files, setFiles] = useState<any[]>(transaction?.attached_files || initialData?.attached_files || []); // Инициализируем файлы

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
      return data || [];
    }
  });

  // ... (аналогичные useQuery для suppliers, partners, employees, если они нужны в этой форме) ...
  // Я их уберу для краткости, так как они не используются в вашем примере для Command

  const { data: categoriesData, isLoading: isLoadingCategories } = useTransactionCategories();
  
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData.filter(Boolean) : [];


  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transaction_date: transaction?.transaction_date ? new Date(transaction.transaction_date) : initialData?.transaction_date ? new Date(initialData.transaction_date) : new Date(),
      type: transaction?.type || initialData?.type || "income",
      category_id: transaction?.category_id || initialData?.category_id || undefined, // undefined чтобы плейсхолдер работал
      amount: transaction?.amount || initialData?.amount || undefined, // undefined для плейсхолдера
      currency: transaction?.currency || initialData?.currency || "EUR",
      description: transaction?.description || initialData?.description || "",
      payment_method: transaction?.payment_method || initialData?.payment_method || "",
      related_order_id: transaction?.related_order_id || initialData?.related_order_id || undefined,
      // ... (остальные defaultValues для связанных сущностей)
    },
  });

  const currentType = form.watch("type");

  // useEffect для сброса category_id при смене типа транзакции
  useEffect(() => {
    if (currentType) { // Или более сложная логика, если нужно сбрасывать при смене типа
        const selectedCategory = categories.find(cat => cat.id === form.getValues("category_id"));
        if (selectedCategory && selectedCategory.type !== currentType) {
            form.setValue("category_id", undefined, { shouldValidate: true });
        }
    }
  }, [currentType, form, categories]);


  const filteredCategories = categories.filter(category => category.type === currentType);

  const handleFilesChange = (newFiles: any[]) => {
    setFiles(newFiles);
  };

  const isDataLoading = isLoadingCategories || isLoadingContacts || isLoadingOrders; // Добавьте другие isLoading флаги

  const onSubmitHandler = (data: TransactionFormValues) => {
    const fullData: TransactionFormData = {
      ...data,
      transaction_date: data.transaction_date, // Уже Date
      category_id: Number(data.category_id), // Убедимся, что это число
      amount: Number(data.amount),
      // Убедимся, что опциональные ID передаются как null, если не выбраны
      related_order_id: data.related_order_id || null,
      related_contact_id: data.related_contact_id || null,
      related_supplier_id: data.related_supplier_id || null,
      related_partner_manufacturer_id: data.related_partner_manufacturer_id || null,
      related_user_id: data.related_user_id || null,
      attached_files: files,
      // creator_user_id обычно добавляется в хуке useAddTransaction
    };
    onSuccess(fullData);
  };

  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> {/* Используем Loader2 */}
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
                      // form.setValue("category_id", undefined); // Сбрасываем категорию при смене типа
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
                <FormItem className="flex flex-col">
                  <FormLabel>Категория*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoadingCategories || filteredCategories.length === 0 && !field.value}
                        >
                          {field.value
                            ? filteredCategories.find(
                                (category) => category.id === field.value
                              )?.name
                            : "Выберите категорию"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] md:w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск категории..." />
                        {/* 👇 Вот оно, изменение! 👇 */}
                        <CommandList>
                          <CommandEmpty>Категории не найдены для типа "{currentType === 'income' ? 'Доход' : 'Расход'}"</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {filteredCategories.map((category) => (
                              <CommandItem
                                value={category.name} // Убедитесь, что value это строка
                                key={category.id}
                                onSelect={() => {
                                  form.setValue("category_id", category.id, { shouldValidate: true });
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                         {/* 👆 Вот оно, изменение! 👆 */}
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                      // onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} // Чтобы разрешить пустое поле и 0
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* ... (Остальные поля первой колонки: Currency, Payment Method) ... */}
            {/* Я их пока пропущу, чтобы сфокусироваться на Command */}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Связанный заказ</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoadingOrders}
                        >
                          {field.value
                            ? orders.find((order) => order.id === field.value)?.order_number
                            : "Выберите заказ"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] md:w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск заказа..." />
                        {/* 👇 Вот оно, изменение! 👇 */}
                        <CommandList>
                          <CommandEmpty>Заказы не найдены.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {orders.map((order) => (
                              <CommandItem
                                value={`${order.order_number} ${order.order_name || ''}`} // Уникальное строковое значение
                                key={order.id}
                                onSelect={() => {
                                  form.setValue("related_order_id", order.id, { shouldValidate: true });
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    order.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {order.order_number} {order.order_name ? `- ${order.order_name}` : ''}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                        {/* 👆 Вот оно, изменение! 👆 */}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* ... (Другие связанные сущности: Contact, Supplier, Partner, Employee - аналогично) ... */}
            {/* Я их тоже пока пропущу для краткости */}


            <div className="space-y-2">
              <FormLabel>Прикрепленные файлы</FormLabel>
              <FileUploadSection
                entityType="transactions"
                entityId={transaction?.id || "new"} // 'new' или реальный id для редактирования
                existingFiles={files} // Передаем текущее состояние файлов
                onFilesChange={handleFilesChange} // Функция для обновления состояния файлов
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
                      value={field.value ?? ""} // Убедимся, что value не undefined
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
