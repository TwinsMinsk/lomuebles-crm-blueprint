
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { useRelatedEntitiesData } from "../hooks/useRelatedEntitiesData";
import ContactSelector from "./related-entities/ContactSelector";
import CompanySelector from "./related-entities/CompanySelector";
import LeadSelector from "./related-entities/LeadSelector";
import ManagerSelector from "./related-entities/ManagerSelector";
import PartnerSelector from "./related-entities/PartnerSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface RelatedEntitiesFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  orderType: string;
}

export const RelatedEntitiesFields: React.FC<RelatedEntitiesFieldsProps> = ({ form, orderType }) => {
  const { 
    contacts, 
    companies, 
    leads, 
    managers, 
    partners, 
    isLoading,
    error 
  } = useRelatedEntitiesData();
  
  // Add some console logs for debugging
  React.useEffect(() => {
    console.log("RelatedEntitiesFields data:", { 
      contacts: Array.isArray(contacts) ? contacts.length : "not an array", 
      companies: Array.isArray(companies) ? companies.length : "not an array", 
      leads: Array.isArray(leads) ? leads.length : "not an array", 
      managers: Array.isArray(managers) ? managers.length : "not an array", 
      partners: Array.isArray(partners) ? partners.length : "not an array", 
      isLoading, 
      error 
    });
  }, [contacts, companies, leads, managers, partners, isLoading, error]);

  // Always ensure we pass arrays to child components
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeManagers = Array.isArray(managers) ? managers : [];
  const safePartners = Array.isArray(partners) ? partners : [];

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
              Пожалуйста, убедитесь, что у вас есть доступ к данным. Возможно, требуется авторизация.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Associated Contact (required) */}
        <ContactSelector 
          form={form} 
          contacts={safeContacts} 
          isLoading={isLoading} 
        />

        {/* Associated Company (optional) */}
        <CompanySelector 
          form={form} 
          companies={safeCompanies} 
          isLoading={isLoading} 
        />

        {/* Source Lead (optional) */}
        <LeadSelector 
          form={form} 
          leads={safeLeads} 
          isLoading={isLoading} 
        />

        {/* Assigned Manager (optional) */}
        <ManagerSelector 
          form={form} 
          managers={safeManagers}
          isLoading={isLoading} 
        />

        {/* Partner/Manufacturer - only visible when orderType is "Мебель на заказ" */}
        {orderType === "Мебель на заказ" && (
          <PartnerSelector 
            form={form} 
            partners={safePartners} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};
