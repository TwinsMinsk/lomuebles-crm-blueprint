
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

const CompanySelector: React.FC<CompanySelectorProps> = ({ form, companies, isLoading }) => {
  return (
    <EntitySelector
      form={form}
      fieldName="associatedCompanyId"
      label="Компания клиента"
      options={companies}
      placeholder="Выберите компанию"
      emptyMessage="Компания не найдена."
      isLoading={isLoading}
    />
  );
};

export default CompanySelector;
