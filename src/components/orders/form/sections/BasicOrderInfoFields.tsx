
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { useFilterOptions } from "@/hooks/orders/useFilterOptions";

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
      {/* Order Number */}
      <FormField
        control={form.control}
        name="orderNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Номер заказа</FormLabel>
            <FormControl>
              <Input
                placeholder="Генерируется автоматически"
                {...field}
                value={field.value || ""}
                disabled={true} // Always read-only
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Order Name */}
      <FormField
        control={form.control}
        name="orderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Название заказа</FormLabel>
            <FormControl>
              <Input
                placeholder="Введите название заказа"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Order Type */}
      <FormField
        control={form.control}
        name="orderType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Тип заказа *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип заказа" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {orderTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status Ready Made - only visible when orderType is "Готовая мебель (Tilda)" */}
      {orderType === "Готовая мебель (Tilda)" && (
        <FormField
          control={form.control}
          name="statusReadyMade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус заказа</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {readyMadeStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Status Custom Made - only visible when orderType is "Мебель на заказ" */}
      {orderType === "Мебель на заказ" && (
        <FormField
          control={form.control}
          name="statusCustomMade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус заказа</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customMadeStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Client Language */}
      <FormField
        control={form.control}
        name="clientLanguage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Язык клиента *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите язык" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ES">Испанский (ES)</SelectItem>
                <SelectItem value="EN">Английский (EN)</SelectItem>
                <SelectItem value="RU">Русский (RU)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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
