
import React, { useState } from "react";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, TransactionFormData } from "@/hooks/finance/useTransactions";
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
  category_id: z.number({
    required_error: "Выберите категорию",
  }),
  amount: z.number({
    required_error: "Введите сумму",
  }).positive("Сумма должна быть больше 0"),
  currency: z.string().default("EUR"),
  description: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  related_order_id: z.number().optional().nullable(),
  related_contact_id: z.number().optional().nullable(),
  related_supplier_id: z.number().optional().nullable(),
  related_partner_manufacturer_id: z.number().optional().nullable(),
  related_user_id: z.string().optional().nullable(),
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
  const [files, setFiles] = useState<any[]>([]);
  
  // Fetch related entities with safe data handling and default empty arrays
  const { data: contactsData = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ["contacts-simple"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("contacts").select("contact_id, full_name").order("full_name");
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching contacts:", err);
        return [];
      }
    }
  });
  
  const { data: ordersData = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders-simple"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("orders").select("id, order_number, order_name").order("order_number", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching orders:", err);
        return [];
      }
    }
  });
  
  const { data: suppliersData = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers-simple"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("suppliers").select("supplier_id, company_name").order("company_name");
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        return [];
      }
    }
  });
  
  const { data: partnersData = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: ["partners-simple"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("partners_manufacturers").select("partner_manufacturer_id, company_name").order("company_name");
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching partners:", err);
        return [];
      }
    }
  });
  
  const { data: employeesData = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees-simple"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching employees:", err);
        return [];
      }
    }
  });

  // Get transaction categories
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useTransactionCategories();
  
  // Ensure all arrays are properly initialized
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
  const partners = Array.isArray(partnersData) ? partnersData : [];
  const employees = Array.isArray(employeesData) ? employeesData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData.filter(Boolean) : [];

  // Form initialization
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transaction_date: transaction 
        ? new Date(transaction.transaction_date) 
        : initialData?.transaction_date instanceof Date 
          ? initialData.transaction_date 
          : initialData?.transaction_date 
            ? new Date(initialData.transaction_date)
            : new Date(),
      type: transaction?.type || initialData?.type || "income",
      category_id: transaction?.category_id || initialData?.category_id || undefined,
      amount: transaction?.amount || initialData?.amount || 0,
      currency: transaction?.currency || initialData?.currency || "EUR",
      description: transaction?.description || initialData?.description || "",
      payment_method: transaction?.payment_method || initialData?.payment_method || "",
      related_order_id: transaction?.related_order_id || initialData?.related_order_id || null,
      related_contact_id: transaction?.related_contact_id || initialData?.related_contact_id || null,
      related_supplier_id: transaction?.related_supplier_id || initialData?.related_supplier_id || null,
      related_partner_manufacturer_id: transaction?.related_partner_manufacturer_id || initialData?.related_partner_manufacturer_id || null,
      related_user_id: transaction?.related_user_id || initialData?.related_user_id || null,
    },
  });

  // Get the current selected type to filter categories
  const currentType = form.watch("type");
  
  // Filter categories based on selected type
  const filteredCategories = categories.filter(category => category && category.type === currentType) || [];

  // Handle files change
  const handleFilesChange = (newFiles: any[]) => {
    setFiles(newFiles);
  };

  // Check for loading states
  const isLoading = 
    isLoadingCategories || 
    isLoadingContacts || 
    isLoadingOrders || 
    isLoadingSuppliers || 
    isLoadingPartners || 
    isLoadingEmployees;

  // Handle form submit
  const onSubmit = (data: TransactionFormValues) => {
    const fullData: TransactionFormData = {
      transaction_date: data.transaction_date,
      type: data.type,
      category_id: data.category_id,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      payment_method: data.payment_method,
      related_order_id: data.related_order_id,
      related_contact_id: data.related_contact_id,
      related_supplier_id: data.related_supplier_id,
      related_partner_manufacturer_id: data.related_partner_manufacturer_id,
      related_user_id: data.related_user_id,
      attached_files: files,
    };
    
    onSuccess(fullData);
  };

  // Render a loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>

            {/* Transaction Date */}
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата операции</FormLabel>
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

            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип операции</FormLabel>
                  <Select
                    onValueChange={field.onChange}
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

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Категория</FormLabel>
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
                        >
                          {field.value && filteredCategories.length > 0
                            ? filteredCategories.find(
                                (category) => category && category.id === field.value
                              )?.name || "Выберите категорию"
                            : "Выберите категорию"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      {filteredCategories.length > 0 ? (
                        <Command>
                          <CommandInput placeholder="Поиск категории..." />
                          <CommandEmpty>Категории не найдены</CommandEmpty>
                          <CommandGroup>
                            {filteredCategories.map((category) => (
                              category && (
                                <CommandItem
                                  value={category.name}
                                  key={category.id}
                                  onSelect={() => {
                                    form.setValue("category_id", category.id);
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
                              )
                            ))}
                          </CommandGroup>
                        </Command>
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Нет доступных категорий
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
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

            {/* Payment Method */}
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

            {/* Related Order */}
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
                        >
                          {field.value && orders.length > 0
                            ? orders.find((order) => order && order.id === field.value)?.order_number || "Выберите заказ"
                            : "Выберите заказ"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      {orders.length > 0 ? (
                        <Command>
                          <CommandInput placeholder="Поиск заказа..." />
                          <CommandEmpty>Заказы не найдены</CommandEmpty>
                          <CommandGroup>
                            {orders.map((order) => (
                              order && (
                                <CommandItem
                                  value={order.order_number || ""}
                                  key={order.id}
                                  onSelect={() => {
                                    form.setValue("related_order_id", order.id);
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
                              )
                            ))}
                          </CommandGroup>
                        </Command>
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Нет доступных заказов
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Files upload section */}
            <div className="space-y-2">
              <FormLabel>Прикрепленные файлы</FormLabel>
              <FileUploadSection
                entityType="transactions"
                entityId={transaction?.id || "new"}
                existingFiles={transaction?.attached_files || []}
                onFilesChange={handleFilesChange}
              />
            </div>

            {/* Description */}
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
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
