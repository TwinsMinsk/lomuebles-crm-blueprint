
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector from "./EntitySelector";
import { EntityOption } from "./EntitySelector";

interface CompanySelectorProps {
  form: UseFormReturn<OrderFormValues>;
  companies: EntityOption[];
  isLoading: boolean;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ form, companies = [], isLoading }) => {
  // Ensure companies is always an array
  const safeCompanies = Array.isArray(companies) ? companies : [];
  
  return (
    <EntitySelector
      form={form}
      fieldName="associatedCompanyId"
      label="Компания клиента"
      options={safeCompanies}
      placeholder="Выберите компанию"
      emptyMessage="Компания не найдена."
      isLoading={isLoading}
    />
  );
};

export default CompanySelector;
