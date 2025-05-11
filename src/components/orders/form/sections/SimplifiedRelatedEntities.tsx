
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import SimplifiedEntitySelector from "./simplified/SimplifiedEntitySelector";
import { useSimplifiedRelatedEntities } from "@/hooks/orders/useSimplifiedRelatedEntities";

interface SimplifiedRelatedEntitiesProps {
  form: UseFormReturn<OrderFormValues>;
}

export const SimplifiedRelatedEntities: React.FC<SimplifiedRelatedEntitiesProps> = ({ form }) => {
  // Use our simplified hook for related entities data
  const { 
    contacts, 
    managers, 
    isLoading,
    error 
  } = useSimplifiedRelatedEntities();

  console.log("SimplifiedRelatedEntities rendered with:", {
    contactsLength: contacts?.length || 0,
    managersLength: managers?.length || 0,
    isLoading,
    error
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Загрузка связанных данных...</p>
      </div>
    );
  }

  // Ensure we have arrays even if the query returned undefined
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safeManagers = Array.isArray(managers) ? managers : [];

  return (
    <div className="space-y-4">
      {/* Show error message if any */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <div className="mt-2 text-sm">
              Пожалуйста, убедитесь, что у вас есть доступ к данным или попробуйте обновить страницу.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Associated Contact (required) */}
        <SimplifiedEntitySelector 
          form={form} 
          fieldName="associatedContactId"
          label="Клиент"
          options={safeContacts} 
          placeholder="Выберите клиента"
          emptyMessage="Клиент не найден. Сначала создайте контакт."
          isLoading={isLoading}
          required={true}
        />

        {/* Assigned Manager (optional) */}
        <SimplifiedEntitySelector 
          form={form} 
          fieldName="assignedUserId"
          label="Ответственный менеджер"
          options={safeManagers}
          placeholder="Выберите менеджера"
          emptyMessage="Менеджер не найден."
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};
