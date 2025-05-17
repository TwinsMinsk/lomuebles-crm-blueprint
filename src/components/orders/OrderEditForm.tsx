
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, type Order, type OrderFormValues } from "@/types/order";
import { z } from "zod"; // Import zod
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OrderEditFormProps {
  order: Order;
  onSuccess?: () => void;
}

const OrderEditForm: React.FC<OrderEditFormProps> = ({ order, onSuccess }) => {
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
      paymentStatus: (order.payment_status as any) || null,
      partialPaymentAmount: order.partial_payment_amount || undefined,
      deliveryAddressFull: order.delivery_address_full || undefined,
      notesHistory: order.notes_history || undefined,
      closingDate: order.closing_date || undefined,
      clientLanguage: order.client_language || "RU"
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      // Mock update for now
      console.log("Updating order with data:", data);
      toast.success("Заказ успешно обновлен");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Ошибка при обновлении заказа");
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

              {/* Add more fields as needed */}
            </div>

            {/* Client info section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Информация о клиенте</h3>
              
              {/* Add client-related fields */}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="submit">Сохранить изменения</Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default OrderEditForm;
