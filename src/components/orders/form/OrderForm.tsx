import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types/order";
import { useAddOrder } from "@/hooks/orders/useAddOrder";
import { useUpdateOrder } from "@/hooks/orders/useUpdateOrder";
import { useUsers } from "@/hooks/useUsers"; 
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { useLeads } from "@/hooks/useLeads";
import { usePartners } from "@/hooks/usePartners";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";
import { useOrderFilesUpload } from "@/hooks/orders/useOrderFilesUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X, Paperclip, FileText } from "lucide-react";
import { toast } from "sonner";

// Define order status constants
const ORDER_TYPES = ["Готовая мебель (Tilda)", "Мебель на заказ"];
const READY_MADE_STATUSES = ["Новый", "Ожидает подтверждения", "Ожидает оплаты", "Оплачен", "Передан на сборку", "Готов к отгрузке", "В доставке", "Выполнен", "Отменен"];
const CUSTOM_MADE_STATUSES = ["Новый запрос", "Предварительная оценка", "Согласование ТЗ/Дизайна", "Ожидает замера", "Замер выполнен", "Проектирование", "Согласование проекта", "Ожидает предоплаты", "В производстве", "Готов к монтажу", "Монтаж", "Завершен", "Отменен"];

// Define the order form schema - client_contact_id is now optional
const orderFormSchema = z.object({
  order_name: z.string().optional(),
  order_type: z.enum(["Готовая мебель (Tilda)", "Мебель на заказ"]),
  status: z.string(),
  client_contact_id: z.number().optional().nullable(),
  client_company_id: z.number().optional().nullable(),
  source_lead_id: z.number().optional().nullable(),
  assigned_user_id: z.string().optional().nullable(),
  partner_manufacturer_id: z.number().optional().nullable(),
  final_amount: z.number().optional().nullable(),
  payment_status: z.string().optional().nullable(),
  partial_payment_amount: z.number().optional().nullable(),
  delivery_address_full: z.string().optional().nullable(),
  notes_history: z.string().optional().nullable(),
  attached_files_order_docs: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      uploaded_at: z.string(),
      size: z.number().optional(),
      type: z.string().optional(),
    })
  ).optional().nullable(),
  client_language: z.enum(["ES", "EN", "RU"]),
}).refine(data => {
  // At least one of contact or lead must be specified
  return data.client_contact_id || data.source_lead_id;
}, {
  message: "Необходимо указать либо контакт клиента, либо связанный лид",
  path: ["client_contact_id"]
}).refine(data => {
  // If payment status is "Частично оплачен", partial_payment_amount is required
  if (data.payment_status === "Частично оплачен") {
    return !!data.partial_payment_amount;
  }
  return true;
}, {
  message: "Необходимо указать сумму частичной оплаты",
  path: ["partial_payment_amount"]
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  order?: Order;
  onSuccess?: () => void;
}

interface FileAttachment {
  name: string;
  url: string;
  uploaded_at: string;
  size?: number;
  type?: string;
}

export default function OrderForm({ order, onSuccess }: OrderFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // API hooks
  const { addOrder } = useAddOrder();
  const { updateOrder } = useUpdateOrder();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { statuses, orderTypes, isLoading: isLoadingOptions } = useFilterOptions();
  const uploadFileMutation = useOrderFilesUpload();
  
  // Initialize the form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: order
      ? {
          order_name: order.order_name || "",
          order_type: order.order_type,
          status: order.status,
          client_contact_id: order.client_contact_id || null,
          client_company_id: order.client_company_id || null,
          source_lead_id: order.source_lead_id || null,
          assigned_user_id: order.assigned_user_id || null,
          partner_manufacturer_id: order.partner_manufacturer_id || null,
          final_amount: order.final_amount || null,
          payment_status: order.payment_status || null,
          partial_payment_amount: order.partial_payment_amount || null,
          delivery_address_full: order.delivery_address_full || "",
          notes_history: order.notes_history || "",
          attached_files_order_docs: order.attached_files_order_docs || [],
          client_language: order.client_language,
        }
      : {
          order_name: "",
          order_type: "Готовая мебель (Tilda)" as const,
          status: "Новый",
          client_contact_id: null,
          client_company_id: null,
          source_lead_id: null,
          assigned_user_id: null,
          partner_manufacturer_id: null,
          final_amount: null,
          payment_status: null,
          partial_payment_amount: null,
          delivery_address_full: "",
          notes_history: "",
          attached_files_order_docs: [],
          client_language: "ES" as const,
        },
  });
  
  // Watch for order_type changes to update status options
  const selectedOrderType = form.watch("order_type");
  
  // Watch payment status for conditional rendering of partial payment field
  const paymentStatus = form.watch("payment_status");
  
  // Reset partial payment amount if payment status is not "Частично оплачен"
  useEffect(() => {
    if (paymentStatus !== "Частично оплачен") {
      form.setValue("partial_payment_amount", null);
    }
  }, [paymentStatus, form]);
  
  // Load status options based on order type
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  
  useEffect(() => {
    // Set status options based on order type
    if (selectedOrderType === "Готовая мебель (Tilda)") {
      setStatusOptions(READY_MADE_STATUSES);
    } else {
      setStatusOptions(CUSTOM_MADE_STATUSES);
    }
    
    // Reset status field when order type changes
    const currentStatus = form.getValues("status");
    const newStatusOptions = selectedOrderType === "Готовая мебель (Tilda)" 
      ? READY_MADE_STATUSES 
      : CUSTOM_MADE_STATUSES;
    
    // If current status is not in the new options list, reset to first item
    if (!newStatusOptions.includes(currentStatus)) {
      form.setValue("status", newStatusOptions[0]);
    }
  }, [selectedOrderType, form]);
  
  // Contacts data for selection
  const { contacts, loading: contactsLoading } = useContacts({
    page: 1,
    pageSize: 100,
    sortColumn: "full_name",
  });
  
  // Companies data for selection
  const { companies, loading: companiesLoading } = useCompanies(
    1,
    100,
    "company_name",
    "asc"
  );
  
  // Leads data for selection
  const { leads, loading: leadsLoading } = useLeads();
  
  // Partners data for selection
  const { partners, loading: partnersLoading } = usePartners(
    1,
    100,
    "company_name",
    "asc"
  );

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    setIsUploading(true);
    const fileList = Array.from(e.target.files);
    
    for (const file of fileList) {
      try {
        // Check if orderId exists (editing mode) or use a temporary id for new orders
        const orderId = order?.id || -1;
        
        // Upload the file
        const result = await uploadFileMutation.mutateAsync({
          file,
          orderId,
          userId: user.id
        });
        
        // Update form state with the new file
        const currentFiles = form.getValues("attached_files_order_docs") || [];
        form.setValue("attached_files_order_docs", [...currentFiles, result]);
        
      } catch (error) {
        console.error("Failed to upload file:", error);
        // Error handling is done by the mutation hook
      }
    }
    
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
    setIsUploading(false);
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    const currentFiles = form.getValues("attached_files_order_docs") || [];
    if (!currentFiles.length || index >= currentFiles.length) return;
    
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    form.setValue("attached_files_order_docs", newFiles);
  };

  async function onSubmit(values: OrderFormValues) {
    if (!user) {
      toast.error("Необходимо авторизоваться для создания заказа");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (order) {
        // Update existing order
        await updateOrder({
          orderId: order.id,
          orderData: {
            ...values,
          },
        });
        toast.success("Заказ успешно обновлен");
      } else {
        // Create new order - client_contact_id is now optional
        await addOrder({
          ...values,
          client_contact_id: values.client_contact_id || null,
          client_language: values.client_language as "ES" | "EN" | "RU",
          order_type: values.order_type,
          status: values.status,
          creator_user_id: user.id
        });
        toast.success("Заказ успешно создан");
        
        // Reset form after successful creation
        form.reset();
      }
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message || 'Что-то пошло не так'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Type & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Type */}
          <FormField
            control={form.control}
            name="order_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип заказа</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип заказа" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORDER_TYPES.map((type) => (
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

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting || isLoadingOptions}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingOptions ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Загрузка...</span>
                      </div>
                    ) : (
                      statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Order Name */}
        <FormField
          control={form.control}
          name="order_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название заказа</FormLabel>
              <FormControl>
                <Input placeholder="Введите название" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Selection - Now optional */}
        <FormField
          control={form.control}
          name="client_contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Контакт клиента</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                value={field.value?.toString() || "null"}
                disabled={isSubmitting || contactsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите контакт (необязательно)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Без контакта</SelectItem>
                  {contactsLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Загрузка контактов...</span>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <SelectItem
                        key={contact.contact_id}
                        value={contact.contact_id.toString()}
                      >
                        {contact.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Selection */}
        <FormField
          control={form.control}
          name="client_company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Компания клиента</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                value={field.value?.toString() || "null"}
                disabled={isSubmitting || companiesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите компанию" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Без компании</SelectItem>
                  {companiesLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Загрузка компаний...</span>
                    </div>
                  ) : (
                    companies.map((company) => (
                      <SelectItem
                        key={company.company_id}
                        value={company.company_id.toString()}
                      >
                        {company.company_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lead Selection */}
        <FormField
          control={form.control}
          name="source_lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанный лид</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                value={field.value?.toString() || "null"}
                disabled={isSubmitting || leadsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите лид" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Без лида</SelectItem>
                  {leadsLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Загрузка лидов...</span>
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <SelectItem
                        key={lead.lead_id}
                        value={lead.lead_id.toString()}
                      >
                        {lead.name || `Лид #${lead.lead_id}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assigned User Selection */}
        <FormField
          control={form.control}
          name="assigned_user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ответственный менеджер</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                value={field.value || "null"}
                disabled={isSubmitting || isLoadingUsers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите менеджера" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Не назначен</SelectItem>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Загрузка пользователей...</span>
                    </div>
                  ) : (
                    users
                      .filter(
                        (user) => 
                          user.role === "Менеджер" || 
                          user.role === "Администратор" ||
                          user.role === "Главный Администратор"
                      )
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Partner Selection */}
        <FormField
          control={form.control}
          name="partner_manufacturer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Партнер-производитель</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                value={field.value?.toString() || "null"}
                disabled={isSubmitting || partnersLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите партнера" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Без партнера</SelectItem>
                  {partnersLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Загрузка партнеров...</span>
                    </div>
                  ) : (
                    partners.map((partner) => (
                      <SelectItem
                        key={partner.partner_manufacturer_id}
                        value={partner.partner_manufacturer_id.toString()}
                      >
                        {partner.company_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Final Amount */}
          <FormField
            control={form.control}
            name="final_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Итоговая сумма</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Status */}
          <FormField
            control={form.control}
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус оплаты</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус оплаты" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Не оплачен">Не оплачен</SelectItem>
                    <SelectItem value="Частично оплачен">Частично оплачен</SelectItem>
                    <SelectItem value="Оплачен полностью">Оплачен полностью</SelectItem>
                    <SelectItem value="Возврат">Возврат</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Partial Payment Amount - Only show when payment status is "Частично оплачен" */}
        {paymentStatus === "Частично оплачен" && (
          <FormField
            control={form.control}
            name="partial_payment_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сумма частичной оплаты</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Client Language */}
        <FormField
          control={form.control}
          name="client_language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Язык клиента</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ES">Испанский</SelectItem>
                  <SelectItem value="EN">Английский</SelectItem>
                  <SelectItem value="RU">Русский</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery Address */}
        <FormField
          control={form.control}
          name="delivery_address_full"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адрес доставки</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Укажите полный адрес доставки" 
                  className="resize-none" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes History */}
        <FormField
          control={form.control}
          name="notes_history"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Примечания</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Примечания и комментарии к заказу" 
                  className="min-h-[100px]" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Attached Files */}
        <div className="space-y-4">
          <FormLabel>Прикрепленные файлы</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={isSubmitting || isUploading}
              className="max-w-md"
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            )}
          </div>
          <div className="space-y-2">
            {form.watch("attached_files_order_docs")?.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between bg-gray-50 p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {file.name}
                  </a>
                  {file.size && (
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
            {!form.watch("attached_files_order_docs")?.length && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>Нет прикрепленных файлов</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? "Сохранить изменения" : "Создать заказ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
