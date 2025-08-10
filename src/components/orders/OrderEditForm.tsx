import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, type Order, type OrderFormValues } from "@/types/order";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateOrder } from "@/hooks/orders/useUpdateOrder";
import { useUsers } from "@/hooks/useUsers";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { useLeads } from "@/hooks/useLeads";
import { usePartners } from "@/hooks/usePartners";
import { useEntityFileUpload } from "@/hooks/useEntityFileUpload";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Paperclip, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define order status constants
const READY_MADE_STATUSES = ["Новый", "Ожидает подтверждения", "Ожидает оплаты", "Оплачен", "Передан на сборку", "Готов к отгрузке", "В доставке", "Выполнен", "Отменен"];
const CUSTOM_MADE_STATUSES = ["Новый запрос", "Предварительная оценка", "Согласование ТЗ/Дизайна", "Ожидает замера", "Замер выполнен", "Проектирование", "Согласование проекта", "Ожидает предоплаты", "В производстве", "Готов к монтажу", "Монтаж", "Завершен", "Отменен"];

interface OrderEditFormProps {
  order: Order;
  onSuccess?: () => void;
}

const OrderEditForm: React.FC<OrderEditFormProps> = ({ order, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { updateOrder } = useUpdateOrder();
  const uploadFileMutation = useEntityFileUpload();

  // API hooks for selectors
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { contacts, loading: contactsLoading } = useContacts({ page: 1, pageSize: 100, sortColumn: "full_name" });
  const { companies, loading: companiesLoading } = useCompanies(1, 100, "company_name", "asc");
  const { leads, loading: leadsLoading } = useLeads();
  const { partners, loading: partnersLoading } = usePartners(1, 100, "company_name", "asc");

  // Get status options based on order type
  const statusOptions = order.order_type === "Готовая мебель (Tilda)" ? READY_MADE_STATUSES : CUSTOM_MADE_STATUSES;

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderName: order.order_name || undefined,
      orderType: order.order_type,
      status: order.status || "",
      clientContactId: order.client_contact_id,
      clientCompanyId: order.client_company_id || undefined,
      sourceLeadId: order.source_lead_id || undefined,
      assignedUserId: order.assigned_user_id || undefined,
      partnerManufacturerId: order.partner_manufacturer_id || undefined,
      finalAmount: order.final_amount || undefined,
      paymentStatus: order.payment_status || null,
      partialPaymentAmount: order.partial_payment_amount || undefined,
      deliveryAddressFull: order.delivery_address_full || undefined,
      notesHistory: order.notes_history || undefined,
      clientLanguage: order.client_language || "RU"
    },
  });

  // Watch payment status for conditional rendering
  const paymentStatus = form.watch("paymentStatus");

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    setIsUploading(true);
    const fileList = Array.from(e.target.files);
    
    for (const file of fileList) {
      try {
        const result = await uploadFileMutation.mutateAsync({
          file,
          entityType: 'orders',
          entityId: order.id,
          userId: user.id
        });
        
        // Update form state with the new file
        const currentFiles = form.getValues("attachedFilesOrderDocs") || [];
        form.setValue("attachedFilesOrderDocs", [...currentFiles, result]);
        
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
    const currentFiles = form.getValues("attachedFilesOrderDocs") || [];
    if (!currentFiles.length || index >= currentFiles.length) return;
    
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    form.setValue("attachedFilesOrderDocs", newFiles);
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Map form values to API expected format
      const orderData: Partial<Order> = {
        order_name: data.orderName || null,
        status: data.status,
        client_contact_id: data.clientContactId,
        client_company_id: data.clientCompanyId || null,
        source_lead_id: data.sourceLeadId || null,
        assigned_user_id: data.assignedUserId || null,
        partner_manufacturer_id: data.partnerManufacturerId || null,
        final_amount: data.finalAmount || null,
        payment_status: data.paymentStatus,
        partial_payment_amount: data.partialPaymentAmount || null,
        delivery_address_full: data.deliveryAddressFull || null,
        notes_history: data.notesHistory || null,
        attached_files_order_docs: data.attachedFilesOrderDocs || order.attached_files_order_docs,
        client_language: data.clientLanguage,
      };

      await updateOrder({ 
        orderId: order.id, 
        orderData 
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(`Ошибка при сохранении: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic info section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Основная информация</h3>
              
              <FormField
                control={form.control}
                name="orderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название заказа</FormLabel>
                    <FormControl>
                      <Input placeholder="Название заказа" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                name="finalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сумма заказа</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentStatus"
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

              {paymentStatus === "Частично оплачен" && (
                <FormField
                  control={form.control}
                  name="partialPaymentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сумма частичной оплаты</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Client info section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Информация о клиенте</h3>
              
              <FormField
                control={form.control}
                name="clientContactId"
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

              <FormField
                control={form.control}
                name="clientCompanyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Компания клиента</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? undefined : Number(value))}
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

              <FormField
                control={form.control}
                name="clientLanguage"
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
            </div>
          </div>

          {/* Responsible persons section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ответственные и связи</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ответственный менеджер</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? undefined : value)}
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

              <FormField
                control={form.control}
                name="partnerManufacturerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Партнер-производитель</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? undefined : Number(value))}
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

              <FormField
                control={form.control}
                name="sourceLeadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный лид</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? undefined : Number(value))}
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
            </div>
          </div>

          {/* Other fields section */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="deliveryAddressFull"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес доставки</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Введите полный адрес доставки" 
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
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
          </div>

          {/* File Uploads Section */}
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
              {(form.watch("attachedFilesOrderDocs") || order.attached_files_order_docs || []).map((file, index) => (
                <div 
                  key={`${file.name}-${index}`} 
                  className="flex items-center justify-between bg-gray-50 p-2 rounded border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          const marker = '/storage/v1/object/public/';
                          let targetUrl = file.url as string;
                          const idx = targetUrl.indexOf(marker);
                          if (idx !== -1) {
                            const after = targetUrl.substring(idx + marker.length);
                            const firstSlash = after.indexOf('/');
                            if (firstSlash > -1) {
                              const bucket = after.substring(0, firstSlash);
                              const path = after.substring(firstSlash + 1);
                              const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 5);
                              if (data?.signedUrl) targetUrl = data.signedUrl;
                            }
                          }
                          window.open(targetUrl, '_blank', 'noopener,noreferrer');
                        } catch (e) {
                          console.error('Failed to open file', e);
                        }
                      }}
                      className="text-blue-600 hover:underline text-sm text-left"
                    >
                      {file.name}
                    </button>
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
              {!(form.watch("attachedFilesOrderDocs") || order.attached_files_order_docs || []).length && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span>Нет прикрепленных файлов</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить изменения
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default OrderEditForm;
