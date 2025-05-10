
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
import { AlertCircle } from "lucide-react";

interface RelatedEntitiesFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  orderType: string;
}

export const RelatedEntitiesFields: React.FC<RelatedEntitiesFieldsProps> = ({ form, orderType }) => {
  const { 
    contacts = [], 
    companies = [], 
    leads = [], 
    managers = [], 
    partners = [], 
    isLoading,
    error 
  } = useRelatedEntitiesData();
  
  // Add some console logs for debugging
  React.useEffect(() => {
    console.log("RelatedEntitiesFields rendered with data:", 
      { contacts: contacts.length, companies: companies.length, 
        leads: leads.length, managers: managers.length, 
        partners: partners.length, isLoading, error });
  }, [contacts, companies, leads, managers, partners, isLoading, error]);

  return (
    <div className="space-y-4">
      {/* Show error message if any */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Associated Contact (required) */}
        <ContactSelector 
          form={form} 
          contacts={Array.isArray(contacts) ? contacts : []} 
          isLoading={isLoading} 
        />

        {/* Associated Company (optional) */}
        <CompanySelector 
          form={form} 
          companies={Array.isArray(companies) ? companies : []} 
          isLoading={isLoading} 
        />

        {/* Source Lead (optional) */}
        <LeadSelector 
          form={form} 
          leads={Array.isArray(leads) ? leads : []} 
          isLoading={isLoading} 
        />

        {/* Assigned Manager (optional) */}
        <ManagerSelector 
          form={form} 
          managers={Array.isArray(managers) ? managers : []} 
          isLoading={isLoading} 
        />

        {/* Partner/Manufacturer - only visible when orderType is "Мебель на заказ" */}
        {orderType === "Мебель на заказ" && (
          <PartnerSelector 
            form={form} 
            partners={Array.isArray(partners) ? partners : []} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};
