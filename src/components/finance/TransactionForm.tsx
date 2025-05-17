
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useTransactionCategories } from "@/hooks/finance/useTransactionCategories";
import { useUsers } from "@/hooks/useUsers";
import { FileUploadSection } from "@/components/common/FileUploadSection";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionFormData } from "@/hooks/finance/useTransactions";
import { useOrders } from "@/hooks/orders/useOrders";
import { useContacts } from "@/hooks/useContacts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePartners } from "@/hooks/usePartners";

const transactionSchema = z.object({
  transaction_date: z.string().min(1, "Дата операции обязательна"),
  type: z.enum(["income", "expense"], {
    required_error: "Необходимо выбрать тип операции",
  }),
  category_id: z.number({
    required_error: "Категория обязательна",
  }),
  amount: z.number().positive("Сумма должна быть положительной"),
  currency: z.string().default("EUR"),
  description: z.string().optional().nullable(),
  related_order_id: z.number().optional().nullable(),
  related_contact_id: z.number().optional().nullable(),
  related_supplier_id: z.number().optional().nullable(),
  related_partner_manufacturer_id: z.number().optional().nullable(),
  related_user_id: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  attached_files: z.any().optional().nullable(),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: any;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  isSubmitting,
}) => {
  const [attachedFiles, setAttachedFiles] = useState<any[]>(
    initialData?.attached_files || []
  );
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    initialData?.type || "income"
  );

  const { data: categories } = useTransactionCategories();
  const { data: orders } = useOrders({ pageSize: 100 });
  const { contacts } = useContacts();
  const { suppliers } = useSuppliers();
  const { partners } = usePartners();
  const { users } = useUsers();

  // Filter categories based on selected type
  const filteredCategories = categories?.filter(
    (category) => category.type === transactionType
  ) || [];

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_date: initialData?.transaction_date || format(new Date(), "yyyy-MM-dd"),
      type: initialData?.type || "income",
      category_id: initialData?.category_id || undefined,
      amount: initialData?.amount || undefined,
      currency: initialData?.currency || "EUR",
      description: initialData?.description || "",
      related_order_id: initialData?.related_order_id || null,
      related_contact_id: initialData?.related_contact_id || null,
      related_supplier_id: initialData?.related_supplier_id || null,
      related_partner_manufacturer_id: initialData?.related_partner_manufacturer_id || null,
      related_user_id: initialData?.related_user_id || null,
      payment_method: initialData?.payment_method || "",
      attached_files: initialData?.attached_files || null,
    },
  });

  // When transaction type changes, reset category selection
  useEffect(() => {
    const currentType = form.getValues("type");
    if (currentType !== transactionType) {
      form.setValue("category_id", undefined as any);
    }
    setTransactionType(currentType);
  }, [form.watch("type")]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      ...data,
      attached_files: attachedFiles.length > 0 ? attachedFiles : null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transaction Date */}
          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата операции *</FormLabel>
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
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
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
                <FormLabel>Тип операции *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value: "income" | "expense") => {
                      field.onChange(value);
                      setTransactionType(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип операции" />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Категория *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? filteredCategories.find(
                              (category) => category.id === field.value
                            )?.name || "Выберите категорию"
                          : "Выберите категорию"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Поиск категории..." />
                      <CommandEmpty>Категории не найдены</CommandEmpty>
                      <CommandGroup>
                        {filteredCategories.map((category) => (
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
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue="EUR"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="EUR" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="RUB">RUB</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                  placeholder="Введите описание операции"
                  {...field}
                  value={field.value || ""}
                />
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
              <FormControl>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите способ оплаты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="card">Карта</SelectItem>
                    <SelectItem value="bank_transfer">Банковский перевод</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value && orders?.data
                          ? orders.data.find((order) => order.id === field.value)
                              ?.order_number || "Выберите заказ"
                          : "Выберите заказ"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Поиск заказа..." />
                      <CommandEmpty>Заказы не найдены</CommandEmpty>
                      <CommandGroup>
                        {orders?.data?.map((order) => (
                          <CommandItem
                            value={order.order_number}
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
                            {order.order_number} - {order.order_name || "Без названия"}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Related Contact */}
          <FormField
            control={form.control}
            name="related_contact_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Связанный контакт</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? contacts?.find(
                              (contact) => contact.contact_id === field.value
                            )?.full_name || "Выберите контакт"
                          : "Выберите контакт"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Поиск контакта..." />
                      <CommandEmpty>Контакты не найдены</CommandEmpty>
                      <CommandGroup>
                        {contacts?.map((contact) => (
                          <CommandItem
                            value={contact.full_name}
                            key={contact.contact_id}
                            onSelect={() => {
                              form.setValue("related_contact_id", contact.contact_id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                contact.contact_id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {contact.full_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional related entities conditionally shown by transaction type */}
        {transactionType === "expense" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Related Supplier */}
            <FormField
              control={form.control}
              name="related_supplier_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Связанный поставщик</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? suppliers?.find(
                                (supplier) => supplier.supplier_id === field.value
                              )?.supplier_name || "Выберите поставщика"
                            : "Выберите поставщика"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск поставщика..." />
                        <CommandEmpty>Поставщики не найдены</CommandEmpty>
                        <CommandGroup>
                          {suppliers?.map((supplier) => (
                            <CommandItem
                              value={supplier.supplier_name}
                              key={supplier.supplier_id}
                              onSelect={() => {
                                form.setValue("related_supplier_id", supplier.supplier_id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  supplier.supplier_id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {supplier.supplier_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Related Partner/Manufacturer */}
            <FormField
              control={form.control}
              name="related_partner_manufacturer_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Связанный партнер-изготовитель</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? partners?.find(
                                (partner) =>
                                  partner.partner_manufacturer_id === field.value
                              )?.company_name || "Выберите партнера"
                            : "Выберите партнера"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск партнера..." />
                        <CommandEmpty>Партнеры не найдены</CommandEmpty>
                        <CommandGroup>
                          {partners?.map((partner) => (
                            <CommandItem
                              value={partner.company_name}
                              key={partner.partner_manufacturer_id}
                              onSelect={() => {
                                form.setValue(
                                  "related_partner_manufacturer_id",
                                  partner.partner_manufacturer_id
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  partner.partner_manufacturer_id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {partner.company_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Related User (For employee expenses) */}
        {transactionType === "expense" && (
          <FormField
            control={form.control}
            name="related_user_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Связанный сотрудник</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? users?.find((user) => user.id === field.value)?.full_name ||
                            "Выберите сотрудника"
                          : "Выберите сотрудника"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Поиск сотрудника..." />
                      <CommandEmpty>Сотрудники не найдены</CommandEmpty>
                      <CommandGroup>
                        {users?.map((user) => (
                          <CommandItem
                            value={user.full_name || user.email}
                            key={user.id}
                            onSelect={() => {
                              form.setValue("related_user_id", user.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                user.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.full_name || user.email}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* File Upload Section */}
        <div className="mt-6">
          <h3 className="mb-2 font-medium">Прикрепленные файлы</h3>
          <FileUploadSection
            entityType="transactions"
            entityId={initialData?.id}
            existingFiles={attachedFiles}
            onFilesChange={setAttachedFiles}
          />
        </div>

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

export default TransactionForm;
