
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchema, OrderFormValues } from "./orderFormSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { BasicOrderInfoFields } from "./sections/BasicOrderInfoFields";
import { RelatedEntitiesFields } from "./sections/RelatedEntitiesFields";
import { FinancialInfoFields } from "./sections/FinancialInfoFields";
import { AdditionalInfoFields } from "./sections/AdditionalInfoFields";
import { OrderItemsSection } from "./sections/OrderItemsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderFormProps {
  orderId?: number;
  defaultValues?: Partial<OrderFormValues>;
  isEdit?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  orderId,
  defaultValues = {},
  isEdit = false
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Ensure defaultValues has the correct format for attachedFilesOrderDocs
  const formattedDefaultValues = {
    ...defaultValues,
    attachedFilesOrderDocs: defaultValues?.attachedFilesOrderDocs || []
  };
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: "Готовая мебель (Tilda)",
      clientLanguage: "ES",
      ...formattedDefaultValues
    },
    mode: "onChange"
  });

  // Watch orderType to show/hide appropriate fields
  const orderType = form.watch("orderType");
  const associatedContactId = form.watch("associatedContactId");
  
  // Fetch contact address when associatedContactId changes
  useEffect(() => {
    const fetchContactAddress = async () => {
      if (!associatedContactId) return;
      
      try {
        const { data: contact, error } = await supabase
          .from("contacts")
          .select(`
            delivery_address_street,
            delivery_address_number,
            delivery_address_apartment,
            delivery_address_city,
            delivery_address_postal_code,
            delivery_address_country
          `)
          .eq("contact_id", associatedContactId)
          .single();
          
        if (error) throw error;
        
        if (contact) {
          // Format full address from contact address fields
          const addressParts = [
            contact.delivery_address_street,
            contact.delivery_address_number && `№${contact.delivery_address_number}`,
            contact.delivery_address_apartment && `кв./офис ${contact.delivery_address_apartment}`,
            contact.delivery_address_city,
            contact.delivery_address_postal_code,
            contact.delivery_address_country
          ].filter(Boolean);
          
          const fullAddress = addressParts.join(', ');
          
          if (fullAddress && !form.getValues("deliveryAddressFull")) {
            form.setValue("deliveryAddressFull", fullAddress);
          }
        }
      } catch (error) {
        console.error("Error fetching contact address:", error);
      }
    };
    
    fetchContactAddress();
  }, [associatedContactId, form]);
  
  const onSubmit = async (data: OrderFormValues) => {
    setIsLoading(true);
    
    try {
      // Get current user information
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не аутентифицирован");
      
      // Prepare data for saving
      const orderData: any = {
        order_name: data.orderName,
        order_type: data.orderType,
        client_language: data.clientLanguage,
        associated_contact_id: data.associatedContactId,
        associated_company_id: data.associatedCompanyId || null,
        source_lead_id: data.sourceLeadId || null,
        assigned_user_id: data.assignedUserId || null,
        final_amount: data.finalAmount || null,
        payment_status: data.paymentStatus || null,
        delivery_address_full: data.deliveryAddressFull || null,
        notes_history: data.notesHistory || null,
        closing_date: data.closingDate || null,
        attached_files_order_docs: data.attachedFilesOrderDocs || []
      };
      
      // Set status based on order type
      if (data.orderType === "Готовая мебель (Tilda)") {
        orderData.status_ready_made = data.statusReadyMade;
        orderData.status_custom_made = null;
      } else {
        orderData.status_custom_made = data.statusCustomMade;
        orderData.status_ready_made = null;
        orderData.associated_partner_manufacturer_id = data.associatedPartnerManufacturerId;
      }
      
      // For new orders, set creator and creation date
      if (!isEdit) {
        orderData.creator_user_id = user.id;
        // Order number will be generated by database trigger
      } else if (data.notesHistory) {
        // Add timestamp and user to notes history
        const timestamp = new Date().toLocaleString('ru-RU');
        const currentNotes = data.notesHistory;
        orderData.notes_history = `${currentNotes}\n\n${timestamp} - Обновлено пользователем ${user.email}`;
      }
      
      let result;
      
      if (isEdit && orderId) {
        // Update existing order
        const { data, error } = await supabase
          .from("deals_orders")
          .update(orderData)
          .eq("deal_order_id", orderId)
          .select();
          
        if (error) throw error;
        result = data[0];
        toast.success("Заказ успешно обновлен");
      } else {
        // Create new order
        const { data, error } = await supabase
          .from("deals_orders")
          .insert(orderData)
          .select();
          
        if (error) throw error;
        result = data[0];
        toast.success("Заказ успешно создан");
      }
      
      navigate("/orders");
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error(`Ошибка при сохранении заказа: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основные данные заказа</CardTitle>
            <CardDescription>Заполните основную информацию о заказе</CardDescription>
          </CardHeader>
          <CardContent>
            <BasicOrderInfoFields isEdit={isEdit} form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Связанные сущности</CardTitle>
            <CardDescription>Укажите клиента, компанию и другие связанные данные</CardDescription>
          </CardHeader>
          <CardContent>
            <RelatedEntitiesFields form={form} orderType={orderType} />
          </CardContent>
        </Card>
        
        {/* Add the Order Items section */}
        <OrderItemsSection form={form} orderId={orderId} />
        
        <Card>
          <CardHeader>
            <CardTitle>Финансовая информация</CardTitle>
            <CardDescription>Управление финансовыми данными заказа</CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialInfoFields form={form} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Дополнительная информация</CardTitle>
            <CardDescription>Адрес доставки, комментарии и файлы по заказу</CardDescription>
          </CardHeader>
          <CardContent>
            <AdditionalInfoFields form={form} />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/orders")}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Сохранить изменения" : "Создать заказ"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
