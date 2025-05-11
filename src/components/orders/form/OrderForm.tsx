
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchema, OrderFormValues } from "./orderFormSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { OrderFormSections } from "./OrderFormSections";
import { useOrderFormSubmit } from "./hooks/useOrderFormSubmit";
import { useContactAddress } from "./hooks/useContactAddress";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [formError, setFormError] = useState<string | null>(null);
  
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
  const { isLoading, onSubmit } = useOrderFormSubmit({ 
    orderId, 
    isEdit,
    onError: (error) => {
      setFormError(error.message);
      // Auto-scroll to error message
      setTimeout(() => {
        const errorAlert = document.getElementById("order-form-error");
        if (errorAlert) {
          errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  });
  
  useContactAddress(form);
  
  // Watch orderType to pass to OrderFormSections
  const orderType = form.watch("orderType");

  const handleFormSubmit = async (data: OrderFormValues) => {
    setFormError(null);
    
    // Additional validation for order
    if (!data.associatedContactId) {
      toast.error("Необходимо выбрать клиента");
      return;
    }
    
    // Custom order type specific validation
    if (data.orderType === "Мебель на заказ" && data.statusReadyMade) {
      form.setValue("statusReadyMade", null);
    }
    
    // Ready-made order type specific validation  
    if (data.orderType === "Готовая мебель (Tilda)" && data.statusCustomMade) {
      form.setValue("statusCustomMade", null);
    }
    
    // Submit the form
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Display form errors */}
        {formError && (
          <Alert variant="destructive" id="order-form-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <span className="font-bold">Ошибка сохранения заказа:</span> {formError}
            </AlertDescription>
          </Alert>
        )}
        
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
