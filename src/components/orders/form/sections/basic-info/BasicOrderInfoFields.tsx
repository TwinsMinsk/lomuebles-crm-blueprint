
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";
import { OrderTypeField } from "./OrderTypeField";
import { OrderStatusField } from "./OrderStatusFields";
import { ClientLanguageField } from "./ClientLanguageField";
import { OrderNumberField, OrderNameField } from "./OrderIdentifierFields";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface BasicOrderInfoFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  isEdit: boolean;
}

export const BasicOrderInfoFields: React.FC<BasicOrderInfoFieldsProps> = ({ form, isEdit }) => {
  const { orderTypes, readyMadeStatuses, customMadeStatuses, isLoading } = useFilterOptions();
  
  // Watch orderType to show/hide appropriate fields
  const orderType = form.watch("orderType");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Order Identifiers */}
      <OrderNumberField form={form} />
      <OrderNameField form={form} />
      
      {/* Order Type */}
      <OrderTypeField form={form} orderTypes={orderTypes} isLoading={isLoading} />
      
      {/* Status - conditionally rendered based on order type */}
      {orderType === "Готовая мебель (Tilda)" && (
        <OrderStatusField 
          form={form} 
          statuses={readyMadeStatuses} 
          isLoading={isLoading}
          fieldName="statusReadyMade"
        />
      )}
      
      {orderType === "Мебель на заказ" && (
        <OrderStatusField 
          form={form} 
          statuses={customMadeStatuses} 
          isLoading={isLoading}
          fieldName="statusCustomMade"
        />
      )}
      
      {/* Client Language */}
      <ClientLanguageField form={form} />
      
      {/* Payment Status */}
      <FormField
        control={form.control}
        name="paymentStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Статус оплаты</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
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

      {/* Final Amount */}
      <FormField
        control={form.control}
        name="finalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Сумма заказа (EUR)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0.00"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : null;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
