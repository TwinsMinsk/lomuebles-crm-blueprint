
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Associated Contact (required) */}
      <ContactSelector form={form} contacts={contacts} isLoading={isLoading} />

      {/* Associated Company (optional) */}
      <CompanySelector form={form} companies={companies} isLoading={isLoading} />

      {/* Source Lead (optional) */}
      <LeadSelector form={form} leads={leads} isLoading={isLoading} />

      {/* Assigned Manager (optional) */}
      <ManagerSelector form={form} managers={managers} isLoading={isLoading} />

      {/* Partner/Manufacturer - only visible when orderType is "Мебель на заказ" */}
      {orderType === "Мебель на заказ" && (
        <PartnerSelector form={form} partners={partners} isLoading={isLoading} />
      )}
    </div>
  );
};
