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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define the order form schema
const orderFormSchema = z.object({
  order_name: z.string().optional(),
  order_type: z.enum(["Готовая мебель (Tilda)", "Мебель на заказ"]),
  status: z.string(),
  client_contact_id: z.number(),
  client_company_id: z.number().optional().nullable(),
  source_lead_id: z.number().optional().nullable(),
  assigned_user_id: z.string().optional().nullable(),
  partner_manufacturer_id: z.number().optional().nullable(),
  final_amount: z.number().optional().nullable(),
  payment_status: z.string().optional().nullable(),
  delivery_address_full: z.string().optional().nullable(),
  notes_history: z.string().optional().nullable(),
  client_language: z.enum(["ES", "EN", "RU"]),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  order?: Order;
  onSuccess?: () => void;
}

export default function OrderForm({ order, onSuccess }: OrderFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API hooks
  const { addOrder } = useAddOrder();
  const { updateOrder } = useUpdateOrder();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { statuses, orderTypes, isLoading: isLoadingOptions } = useFilterOptions();
  
  // Initialize the form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: order
      ? {
          order_name: order.order_name || "",
          order_type: order.order_type,
          status: order.status,
          client_contact_id: order.client_contact_id,
          client_company_id: order.client_company_id || null,
          source_lead_id: order.source_lead_id || null,
          assigned_user_id: order.assigned_user_id || null,
          partner_manufacturer_id: order.partner_manufacturer_id || null,
          final_amount: order.final_amount || null,
          payment_status: order.payment_status || null,
          delivery_address_full: order.delivery_address_full || "",
          notes_history: order.notes_history || "",
          client_language: order.client_language,
        }
      : {
          order_name: "",
          order_type: "Готовая мебель (Tilda)" as const,
          status: "Новый",
          client_contact_id: undefined as any,
          client_company_id: null,
          source_lead_id: null,
          assigned_user_id: null,
          partner_manufacturer_id: null,
          final_amount: null,
          payment_status: null,
          delivery_address_full: "",
          notes_history: "",
          client_language: "ES" as const,
        },
  });
  
  // Watch for order_type changes to update status options
  const selectedOrderType = form.watch("order_type");
  
  // Load status options based on order type
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  
  useEffect(() => {
    // Filter statuses based on order type if needed
    // For now, we're using all statuses regardless of type
    setStatusOptions(statuses || []);
  }, [selectedOrderType, statuses]);
  
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
        // Create new order - ensure required fields are present
        await addOrder({
          ...values,
          client_contact_id: values.client_contact_id as number, // Cast to ensure it's not undefined
          client_language: values.client_language,
          order_type: values.order_type,
          status: values.status,
          creator_user_id: user.id,
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
                    {orderTypes.map((type) => (
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
                  defaultValue={field.value}
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

        {/* Contact Selection */}
        <FormField
          control={form.control}
          name="client_contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Контакт клиента</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={isSubmitting || contactsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите контакт" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
