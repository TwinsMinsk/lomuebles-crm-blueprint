
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { useRelatedEntitiesData } from "../hooks/useRelatedEntitiesData";
import ContactSelector from "./related-entities/ContactSelector";
import CompanySelector from "./related-entities/CompanySelector";
import LeadSelector from "./related-entities/LeadSelector";
import ManagerSelector from "./related-entities/ManagerSelector";
import PartnerSelector from "./related-entities/PartnerSelector";

interface RelatedEntitiesFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  orderType: string;
}

export const RelatedEntitiesFields: React.FC<RelatedEntitiesFieldsProps> = ({ form, orderType }) => {
  const { contacts = [], companies = [], leads = [], managers = [], partners = [], isLoading } = useRelatedEntitiesData();

  // Ensure we are passing arrays, not undefined
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeManagers = Array.isArray(managers) ? managers : [];
  const safePartners = Array.isArray(partners) ? partners : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Associated Contact (required) */}
      <ContactSelector form={form} contacts={safeContacts} isLoading={isLoading} />

      {/* Associated Company (optional) */}
      <CompanySelector form={form} companies={safeCompanies} isLoading={isLoading} />

      {/* Source Lead (optional) */}
      <LeadSelector form={form} leads={safeLeads} isLoading={isLoading} />

      {/* Assigned Manager (optional) */}
      <ManagerSelector form={form} managers={safeManagers} isLoading={isLoading} />

      {/* Partner/Manufacturer - only visible when orderType is "Мебель на заказ" */}
      {orderType === "Мебель на заказ" && (
        <PartnerSelector form={form} partners={safePartners} isLoading={isLoading} />
      )}
    </div>
  );
};
