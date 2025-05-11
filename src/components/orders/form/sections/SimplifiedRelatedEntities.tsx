
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import SimplifiedEntitySelector from "./simplified/SimplifiedEntitySelector";
import { useSimplifiedRelatedEntities } from "@/hooks/orders/useSimplifiedRelatedEntities";
import { useAuth } from "@/context/AuthContext";

interface SimplifiedRelatedEntitiesProps {
  form: UseFormReturn<OrderFormValues>;
}

export const SimplifiedRelatedEntities: React.FC<SimplifiedRelatedEntitiesProps> = ({ form }) => {
  const { session } = useAuth();
  
  // Use our simplified hook for related entities data
  const { 
    contacts, 
    managers, 
    isLoading,
    error 
  } = useSimplifiedRelatedEntities();

  // Add debug logs
  console.log("SimplifiedRelatedEntities rendered with:", {
    contactsLength: contacts?.length || 0,
    managersLength: managers?.length || 0,
    isLoading,
    error,
    isAuthenticated: !!session
  });

  // Show not authenticated warning if no session
  if (!session) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Для доступа к связанным данным необходима авторизация.
          <div className="mt-2 text-sm">
            Пожалуйста, войдите в систему для полного доступа к функциональности.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p className="text-lg font-medium">Загрузка связанных данных...</p>
      </div>
    );
  }

  // Ensure we have arrays even if the query returned undefined
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safeManagers = Array.isArray(managers) ? managers : [];

  // Check if we have data after loading
  const hasNoData = safeContacts.length === 0 && safeManagers.length === 0;

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
      
      {/* Show warning if we have no data but no errors */}
      {!error && hasNoData && (
        <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            Не найдены доступные контакты или менеджеры.
            <div className="mt-2 text-sm">
              Возможно, вам нужно сначала создать контакты в системе.
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

