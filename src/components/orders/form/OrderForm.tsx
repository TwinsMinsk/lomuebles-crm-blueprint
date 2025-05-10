
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchema, OrderFormValues } from "./orderFormSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { OrderFormSections } from "./OrderFormSections";
import { useOrderFormSubmit } from "./hooks/useOrderFormSubmit";
import { useContactAddress } from "./hooks/useContactAddress";

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
  const navigate = useNavigate();
  
  // Ensure defaultValues has the correct format for attachedFilesOrderDocs
  const formattedDefaultValues = {
    ...defaultValues,
    // Always initialize as an array, even if undefined or null
    attachedFilesOrderDocs: Array.isArray(defaultValues?.attachedFilesOrderDocs) 
      ? defaultValues.attachedFilesOrderDocs 
      : []
  };
  
  console.log("Formatted default values:", formattedDefaultValues);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: "Готовая мебель (Tilda)",
      clientLanguage: "ES",
      attachedFilesOrderDocs: [],
      ...formattedDefaultValues
    },
    mode: "onChange"
  });

  // Use our custom hooks
  const { isLoading, onSubmit } = useOrderFormSubmit({ orderId, isEdit });
  useContactAddress(form);
  
  // Watch orderType to pass to OrderFormSections
  const orderType = form.watch("orderType");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OrderFormSections form={form} orderId={orderId} orderType={orderType} />

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
