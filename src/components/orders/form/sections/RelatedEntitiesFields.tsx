
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { useOrderRelatedEntities } from "@/hooks/orders/useOrderRelatedEntities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import EntitySelector from "./related-entities/EntitySelector";

interface RelatedEntitiesFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  orderType: string;
}

export const RelatedEntitiesFields: React.FC<RelatedEntitiesFieldsProps> = ({ form, orderType }) => {
  // Use our new hook for related entities data
  const { 
    contacts, 
    companies, 
    leads, 
    managers, 
    partners, 
    isLoading,
    error 
  } = useOrderRelatedEntities();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Загрузка связанных данных...</p>
      </div>
    );
  }

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
        <EntitySelector 
          form={form} 
          fieldName="associatedContactId"
          label="Клиент"
          options={contacts} 
          placeholder="Выберите клиента"
          emptyMessage="Клиент не найден. Сначала создайте контакт."
          isLoading={isLoading}
          required={true}
        />

        {/* Associated Company (optional) */}
        <EntitySelector 
          form={form} 
          fieldName="associatedCompanyId"
          label="Компания клиента"
          options={companies} 
          placeholder="Выберите компанию"
          emptyMessage="Компания не найдена."
          isLoading={isLoading} 
        />

        {/* Source Lead (optional) */}
        <EntitySelector 
          form={form} 
          fieldName="sourceLeadId"
          label="Исходный лид"
          options={leads} 
          placeholder="Выберите лид"
          emptyMessage="Лид не найден."
          isLoading={isLoading} 
        />

        {/* Assigned Manager (optional) */}
        <EntitySelector 
          form={form} 
          fieldName="assignedUserId"
          label="Ответственный менеджер"
          options={managers}
          placeholder="Выберите менеджера"
          emptyMessage="Менеджер не найден."
          isLoading={isLoading} 
        />

        {/* Partner/Manufacturer - only visible when orderType is "Мебель на заказ" */}
        {orderType === "Мебель на заказ" && (
          <EntitySelector 
            form={form}
            fieldName="associatedPartnerManufacturerId"
            label="Партнер-изготовитель"
            options={partners}
            placeholder="Выберите партнера"
            emptyMessage="Партнер не найден."
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
