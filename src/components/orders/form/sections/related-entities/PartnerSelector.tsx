
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector from "./EntitySelector";
import { EntityOption } from "./EntitySelector";

interface PartnerSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  partners: EntityOption[];
  isLoading: boolean;
}

const PartnerSelector: React.FC<PartnerSelectorProps> = ({ form, partners = [], isLoading }) => {
  // Ensure partners is always an array
  const safePartners = Array.isArray(partners) ? partners : [];
  
  return (
    <EntitySelector
      form={form}
      fieldName="associatedPartnerManufacturerId"
      label="Партнер-изготовитель"
      options={safePartners}
      placeholder="Выберите партнера"
      emptyMessage="Партнер не найден."
      isLoading={isLoading}
    />
  );
};

export default PartnerSelector;
